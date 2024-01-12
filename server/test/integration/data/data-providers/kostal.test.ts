import 'dotenv/config'
import { readEnv, str, int } from '../../../../src/env/'
import { KostalEnergyUseDataProvider } from '../../../../src/data/data-providers/kostal'

const env = readEnv(process.env, {
  KOSTAL_MODBUS_ADDRESS: str(),
  KOSTAL_MODBUS_PORT: int()
})

describe('KostalEnergyUseProvider', function () {
  let subject: KostalEnergyUseDataProvider

  beforeEach('setup', () => {
    subject = new KostalEnergyUseDataProvider({
      modbusAddress: env.KOSTAL_MODBUS_ADDRESS,
      modbusPort: env.KOSTAL_MODBUS_PORT
    })
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
