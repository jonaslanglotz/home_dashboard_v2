import { PirateWeatherDataProvider } from '../../../../src/data/data-providers/pirate-weather'

import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'
import { log } from '../../../../src/utils/log'

const env = cleanEnv(process.env, {
  PIRATE_WEATHER_API_KEY: str(),
  LATITUDE: num(),
  LONGITUDE: num()
})

describe('PirateWeatherDataProvider', function () {
  let subject: PirateWeatherDataProvider

  beforeEach('setup', () => {
    subject = new PirateWeatherDataProvider({
      apiKey: env.PIRATE_WEATHER_API_KEY,
      latitude: env.LATITUDE,
      longitude: env.LONGITUDE
    })
  })

  describe('#_getRawData()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      const rawData = await subject._getRawData()
      log.info({ rawData })
    })
  })
})
