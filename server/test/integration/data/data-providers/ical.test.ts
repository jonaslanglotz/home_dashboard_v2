import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'
import { IcalEventsProvider } from '../../../../src/data/data-providers/ical'

const env = cleanEnv(process.env, {
  ICAL_CALENDAR_URL: str(),
  ICAL_EVENT_TIME_SPAN_DAYS: num()
})

describe('IcalEventsProvider', function () {
  let subject: IcalEventsProvider

  beforeEach('setup', () => {
    subject = new IcalEventsProvider({
      calendarUrl: env.ICAL_CALENDAR_URL,
      eventTimeSpanDays: env.ICAL_EVENT_TIME_SPAN_DAYS
    })
  })

  describe('#_getIcalData()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      await subject._getIcalData()
    })
  })

  describe('#getData()', function () {
    it('should find some events', async function () {
      this.timeout(5000)
      await subject.getData()
    })
  })
})
