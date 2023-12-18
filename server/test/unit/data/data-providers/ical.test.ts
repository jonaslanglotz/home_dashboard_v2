import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonFakeTimers, type SinonStub } from 'sinon'
import { type Events } from '../../../../../shared-types'
import { IcalEventsProvider } from '../../../../src/data/data-providers/ical'
import { DashboardError } from '../../../../src/utils/dashboard-error'

chai.use(chaiAsPromised)

describe('IcalEventsProvider', function () {
  const icalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ical.marudot.com//iCal Event Maker
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Europe/Berlin
LAST-MODIFIED:20230407T050750Z
TZURL:https://www.tzurl.org/zoneinfo-outlook/Europe/Berlin
X-LIC-LOCATION:Europe/Berlin
BEGIN:DAYLIGHT
TZNAME:CEST
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:CET
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861500416-13327@ical.marudot.com
DTSTART;VALUE=DATE:20231224
DTEND;VALUE=DATE:20231225
SUMMARY:One-Time All-Day Event
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861570327-65854@ical.marudot.com
DTSTART;VALUE=DATE:20231224T
RRULE:FREQ=DAILY;INTERVAL=2
DTEND;VALUE=DATE:20231225
SUMMARY:Recurring All-Day Event
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861466053-54879@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231224T120000
DTEND;TZID=Europe/Berlin:20231224T130000
SUMMARY:One-Time Event
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861545999-91612@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231224T120000
RRULE:FREQ=DAILY;INTERVAL=2
DTEND;TZID=Europe/Berlin:20231224T130000
SUMMARY:Recurring Event
END:VEVENT
END:VCALENDAR`

  const events: Events = [
    {
      name: 'One-Time All-Day Event',
      date: '2023-12-23T23:00:00.000Z',
      hasTime: false
    },
    {
      name: 'One-Time Event',
      date: '2023-12-24T11:00:00.000Z',
      hasTime: true
    },
    {
      name: 'Recurring Event',
      date: '2023-12-24T11:00:00.000Z',
      hasTime: true
    },
    {
      name: 'Recurring Event',
      date: '2023-12-26T11:00:00.000Z',
      hasTime: true
    },
    {
      name: 'Recurring All-Day Event',
      date: '2023-12-24T00:00:00.000Z',
      hasTime: false
    },
    {
      name: 'Recurring All-Day Event',
      date: '2023-12-26T00:00:00.000Z',
      hasTime: false
    }
  ]

  async function positiveResponse (): Promise<Response> {
    return new Response(
      icalData,
      { status: 200, headers: { 'content-type': 'text/plain' } }
    )
  }

  async function negativeResponse (): Promise<Response> {
    return new Response(
      'Bad request',
      { status: 400 }
    )
  }

  let subject: IcalEventsProvider
  let fetchStub: SinonStub
  let clock: SinonFakeTimers

  beforeEach('setup', () => {
    subject = new IcalEventsProvider({
      calendarUrl: 'http://calendar.url',
      eventTimeSpanDays: 3
    })

    fetchStub = sinon.stub(global, 'fetch')
    clock = sinon.useFakeTimers(Date.parse('2023-12-24T11:00:00.000Z'))
  })

  afterEach(function () {
    fetchStub.restore()
    clock.restore()
  })

  describe('#getData', function () {
    it('should return the correct Events when fetch returns valid data', async function () {
      fetchStub.onFirstCall().returns(positiveResponse())

      const value = await subject.getData()

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      assert.sameDeepMembers(value, events)
    })
  })

  describe('#getData', function () {
    it('should throw a DashboadError when fetch returns a non-ok status', async function () {
      fetchStub.onFirstCall().returns(negativeResponse())

      await assert.isRejected(
        subject.getData(),
        DashboardError
      )
    })
  })
})
