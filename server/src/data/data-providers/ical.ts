import { DataProvider } from '../data-provider'
import type { Event, Events } from '../../../../shared-types'
import { DashboardError } from '../../utils/dashboard-error'
import Ical, { type VEvent } from 'node-ical'
import { DateTime } from 'luxon'

interface Options {
  calendarUrl: string
  eventTimeSpanDays: number
}

function shiftDateByDays (date: Date, days: number): Date {
  const shiftedDate = new Date(date)
  shiftedDate.setDate(shiftedDate.getDate() + days)
  return shiftedDate
}

function dateAsUTC (date: Date): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset())
  return result
}

function daysBetween (startDate: Date, endDate: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return (dateAsUTC(endDate).valueOf() - dateAsUTC(startDate).valueOf()) / millisecondsPerDay
}

function toISODateString (date: Date): string {
  return dateAsUTC(date).toISOString().split('T')[0]
}

function uniqBy<T, K extends PropertyKey> (array: T[], keyFunction: (item: T) => K): T[] {
  const seen: Partial<Record<K, boolean>> = {}
  return array.filter(function (item) {
    const key = keyFunction(item)
    return Object.prototype.hasOwnProperty.call(seen, key) ? false : (seen[key] = true)
  })
}

export class IcalEventsProvider extends DataProvider<Events> {
  calendarUrl: string
  eventTimeSpanDays: number

  _calendarComponents: Ical.CalendarComponent[] | undefined

  constructor (options: Options) {
    super()

    this.calendarUrl = options.calendarUrl
    this.eventTimeSpanDays = options.eventTimeSpanDays
  }

  async getData (): Promise<Events> {
    const icalData = await this._getIcalData()
    const rawEvents = this._parseIcalData(icalData)

    return rawEvents.flatMap(rawEvent => this._filterAndConvertRawEvent(rawEvent))
  }

  async _getIcalData (): Promise<string> {
    const res = await fetch(this.calendarUrl)
    const text = await res.text()

    if (!res.ok) {
      throw new DashboardError(
        'Got non-ok return code while fetching calendar data',
        { status: res.status, text }
      )
    }

    return text
  }

  _parseIcalData (icsData: string): Ical.VEvent[] {
    const data = Ical.sync.parseICS(icsData)
    this._calendarComponents = Object.values(data)
    return this._calendarComponents.filter(calendarComponent => calendarComponent.type === 'VEVENT') as Ical.VEvent[]
  }

  _correctStartDates (rrule: NonNullable<VEvent['rrule']>, dates: Date[]): Date[] {
    // Get the timezone identifier from the rrule object
    const tzid = rrule.origOptions.tzid

    if (tzid == null || rrule.origOptions.dtstart == null) { return dates }

    // Get the original start date and UTC offset
    const originalDate = new Date(rrule.origOptions.dtstart)
    const originalTzDate = DateTime.fromJSDate(originalDate, { zone: tzid })
    const originalOffset = originalTzDate.offset

    // Get the current UTC offset
    const currentTzDate = DateTime.fromJSDate(new Date(), { zone: tzid })
    const currentOffset = currentTzDate.offset

    for (const date of dates) {
      // Add the DST offset to the date. This is the bug in node-ical.
      date.setHours(date.getHours() + (originalOffset - currentOffset) / 60)
    }

    return dates
  }

  _filterAndConvertRawEvent (rawEvent: Ical.VEvent): Event[] {
    const relevanceStart = shiftDateByDays(new Date(), -this.eventTimeSpanDays)
    const relevanceEnd = shiftDateByDays(new Date(), this.eventTimeSpanDays)

    const dates: Date[] = []

    if (this._rawEventHasTime(rawEvent)) {
      if (rawEvent.rrule != null) {
        const rawDates = rawEvent.rrule.between(relevanceStart, relevanceEnd)
        // The node-ical library does not take into account changes in the time zone
        // due to daylight savings time. We need to manually correct this.
        const correctedDates = this._correctStartDates(rawEvent.rrule, rawDates)
        dates.push(...correctedDates)
      } else if (rawEvent.start > relevanceStart && rawEvent.start < relevanceEnd) {
        dates.push(rawEvent.start)
      }
    } else {
      const eventLengthInDays = Math.ceil(daysBetween(rawEvent.start, rawEvent.end))

      const startingDates: Date[] = []
      // A multi-day event may start before the relevance period starts,
      // but could still intersect it, so we shift the relevance dates
      if (rawEvent.rrule != null) {
        startingDates.push(...rawEvent.rrule.between(shiftDateByDays(relevanceStart, -eventLengthInDays), relevanceEnd))
      } else if (rawEvent.start > shiftDateByDays(relevanceStart, -eventLengthInDays)) {
        startingDates.push(rawEvent.start)
      }

      const allDates = startingDates
        .flatMap(startingDate => {
          const endingDate = shiftDateByDays(startingDate, eventLengthInDays)

          const firstRelevantDate = startingDate < relevanceStart ? relevanceStart : startingDate
          const lastRelevantDate = endingDate > relevanceEnd ? relevanceEnd : endingDate
          const relevantDayCount = daysBetween(firstRelevantDate, lastRelevantDate)

          return Array.from({ length: relevantDayCount }, (_, offset) => shiftDateByDays(firstRelevantDate, offset))
        })

      dates.push(...uniqBy(allDates, date => toISODateString(date)))
    }

    return dates.map(date => ({
      name: rawEvent.summary,
      date: this._rawEventHasTime(rawEvent) ? date.toISOString() : toISODateString(date),
      hasTime: this._rawEventHasTime(rawEvent)
    }))
  }

  _rawEventHasTime (rawEvent: Ical.VEvent): boolean {
    return rawEvent.datetype === 'date-time'
  }
}

export interface EnvConfigurationValues {
  ICAL_CALENDAR_URL: string
  ICAL_EVENT_TIME_SPAN_DAYS: number
}

export const fromEnv = (env: EnvConfigurationValues): IcalEventsProvider => new IcalEventsProvider({
  calendarUrl: env.ICAL_CALENDAR_URL,
  eventTimeSpanDays: env.ICAL_EVENT_TIME_SPAN_DAYS
})
