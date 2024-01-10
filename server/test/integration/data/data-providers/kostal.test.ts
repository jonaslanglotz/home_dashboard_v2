import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'
import { KostalEnergyUseProvider } from '../../../../src/data/data-providers/kostal'

// const env = cleanEnv(process.env, {
//   ICAL_CALENDAR_URL: str(),
//   ICAL_EVENT_TIME_SPAN_DAYS: num()
// })

describe('KostalEnergyUseProvider', function () {
  let subject: KostalEnergyUseProvider

  beforeEach('setup', () => {
    subject = new KostalEnergyUseProvider({})
  })

  describe('#_getRawData()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      await subject._getRawData()
    })
  })

  describe('#getData()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      await subject.getData()
    })
  })
})

