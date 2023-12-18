import { DataProvider } from '../data-provider'
import type { Event, Events } from '../../../../shared-types'
import { DashboardError } from '../../utils/dashboard-error'
import Ical from 'node-ical'

interface Options {
  calendarUrl: string
  eventTimeSpanDays: number
}

function shiftDateByDays (date: Date, days: number): Date {
  date.setDate(date.getDate() + days)
  return date
}

export class IcalEventsProvider extends DataProvider<Events> {
  calendarUrl: string
  eventTimeSpanDays: number

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
    const calendarComponents = Object.values(data)
    return calendarComponents.filter(calendarComponent => calendarComponent.type === 'VEVENT') as Ical.VEvent[]
  }

  _filterAndConvertRawEvent (rawEvent: Ical.VEvent): Event[] {
    const startOfTimeSpan = shiftDateByDays(new Date(), -this.eventTimeSpanDays)
    const endOfTimeSpan = shiftDateByDays(new Date(), this.eventTimeSpanDays)

    if (rawEvent.rrule == null) {
      if (rawEvent.start < startOfTimeSpan || rawEvent.end > endOfTimeSpan) {
        return []
      }

      return [{
        name: rawEvent.summary,
        date: rawEvent.start.toISOString(),
        hasTime: this._rawEventHasTime(rawEvent)
      }]
    }

    const dates = rawEvent.rrule.between(startOfTimeSpan, endOfTimeSpan)

    return dates.map(date => ({
      name: rawEvent.summary,
      date: date.toISOString(),
      hasTime: this._rawEventHasTime(rawEvent)
    }))
  }

  _rawEventHasTime (rawEvent: Ical.VEvent): boolean {
    return rawEvent.datetype === 'date-time'
  }
}
