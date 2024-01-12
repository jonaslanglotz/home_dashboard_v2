import { TibberEnergyPricesProvider } from '../../../../src/data/data-providers/tibber'

import 'dotenv/config'
import { readEnv, str } from '../../../../src/env/'
import { log } from '../../../../src/utils/log'

const env = readEnv(process.env, {
  TIBBER_API_KEY: str()
})

describe('TibberEnergyPricesProvider', function () {
  let subject: TibberEnergyPricesProvider

  beforeEach('setup', () => {
    subject = new TibberEnergyPricesProvider({
      apiKey: env.TIBBER_API_KEY
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
