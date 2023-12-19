import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonFakeTimers, type SinonStub } from 'sinon'
import { IcalEventsProvider } from '../../../../src/data/data-providers/ical'
import { DashboardError } from '../../../../src/utils/dashboard-error'

chai.use(chaiAsPromised)

describe('IcalEventsProvider', function () {
  function inCalendar (data: string): string {
    return `BEGIN:VCALENDAR
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
${data}
END:VCALENDAR`
  }

  async function positiveResponse (data: string): Promise<Response> {
    return new Response(
      data,
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
    it('should correctly parse multiple events', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861466053-54879@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231224T120000
DTEND;TZID=Europe/Berlin:20231224T130000
SUMMARY:One-Time Event
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20231218T010639Z
UID:1702861466054-54879@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231225T120000
DTEND;TZID=Europe/Berlin:20231225T130000
SUMMARY:One-Time Event 2
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [{
        name: 'One-Time Event',
        date: '2023-12-24T11:00:00.000Z',
        hasTime: true
      }, {
        name: 'One-Time Event 2',
        date: '2023-12-25T11:00:00.000Z',
        hasTime: true
      }])
    })

    it('should correctly parse a one-time event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861466053-54879@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231224T120000
DTEND;TZID=Europe/Berlin:20231224T130000
SUMMARY:One-Time Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [{
        name: 'One-Time Event',
        date: '2023-12-24T11:00:00.000Z',
        hasTime: true
      }])
    })

    it('should correctly parse a one-time all-day event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861500416-13327@ical.marudot.com
DTSTART;VALUE=DATE:20231224
DTEND;VALUE=DATE:20231225
SUMMARY:One-Time All-Day Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [{
        name: 'One-Time All-Day Event',
        date: '2023-12-24',
        hasTime: false
      }])
    })

    it('should correctly parse a recurring event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861545999-91612@ical.marudot.com
DTSTART;TZID=Europe/Berlin:20231224T120000
RRULE:FREQ=DAILY;INTERVAL=2
DTEND;TZID=Europe/Berlin:20231224T130000
SUMMARY:Recurring Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [{
        name: 'Recurring Event',
        date: '2023-12-24T11:00:00.000Z',
        hasTime: true
      },
      {
        name: 'Recurring Event',
        date: '2023-12-26T11:00:00.000Z',
        hasTime: true
      }])
    })

    it('should correctly parse a recurring all-day event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T010638Z
UID:1702861570327-65854@ical.marudot.com
DTSTART;VALUE=DATE:20231224T
RRULE:FREQ=DAILY;INTERVAL=2
DTEND;VALUE=DATE:20231225
SUMMARY:Recurring All-Day Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [{
        name: 'Recurring All-Day Event',
        date: '2023-12-24',
        hasTime: false
      },
      {
        name: 'Recurring All-Day Event',
        date: '2023-12-26',
        hasTime: false
      }])
    })

    it('should correctly parse a one-time multi-day event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231218T173040Z
UID:1702920613045-27816@ical.marudot.com
DTSTART;VALUE=DATE:20231223
DTEND;VALUE=DATE:20231226
SUMMARY:One-Time Multi-Day Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [23, 24, 25].map(day => ({
        name: 'One-Time Multi-Day Event',
        date: `2023-12-${day}`,
        hasTime: false
      })))
    })

    it('should correctly parse a multi-day event starting outside of the configured time span', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231219T184103Z
UID:1702920613045-27816@ical.marudot.com
DTSTART;VALUE=DATE:20231201
DTEND;VALUE=DATE:20231231
SUMMARY:Outside-Interval One-Time Multi-Day Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [21, 22, 23, 24, 25, 26].map(day => ({
        name: 'Outside-Interval One-Time Multi-Day Event',
        date: `2023-12-${day}`,
        hasTime: false
      })))
    })

    it('should correctly parse a recurring multi-day event', async function () {
      const icalData = inCalendar(`BEGIN:VEVENT
DTSTAMP:20231219T184103Z
UID:1703011251979-11629@ical.marudot.com
DTSTART;VALUE=DATE:20231222
RRULE:FREQ=DAILY;INTERVAL=3
DTEND;VALUE=DATE:20231224
SUMMARY:Recurring Multi-Day Event
END:VEVENT`)

      fetchStub.onFirstCall().returns(positiveResponse(icalData))

      const value = await subject.getData()

      assert.deepEqual(value, [22, 23, 25, 26].map(day => ({
        name: 'Recurring Multi-Day Event',
        date: `2023-12-${day}`,
        hasTime: false
      })))
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
