import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonStub } from 'sinon'
import { KostalEnergyUseDataProvider } from '../../../../src/data/data-providers/kostal'

chai.use(chaiAsPromised)

describe('KostalEnergyUseDataProvider', function () {
  let subject: KostalEnergyUseDataProvider
  let getRawDataStub: SinonStub

  beforeEach('setup', () => {
    subject = new KostalEnergyUseDataProvider({
      modbusAddress: '127.0.0.1',
      modbusPort: 502
    })

    getRawDataStub = sinon.stub(subject, '_getRawData')
  })

  afterEach(function () {
    getRawDataStub.restore()
  })

  describe('#getData', function () {
    it('should extract the correct values', async function () {
      //        R/W
      //     Size   Type   Units
      // start address (dec)   Description
      // 0   4  RO  string (8) Block type
      // 4   4  RO  string (8) Block type version
      // 14  2  RO  int32  W   Sum output inverter AC
      // 16  2  RO  uint32 W   Sum pv power inverter DC
      // 22  2  RO  int32  W   Home consumption
      // 24  2  RO  int32  W   Sum battery charge / discharge DC
      // 26  1  RO  uint16 %   System state of charge
      // 34  1  RO  uint16     Active charge mode
      // 36  2  RO  uint32 W   Sum wallbox charge power total
      // 38  2  RO  uint32 W   Sum wallbox charge power pv
      // 40  2  RO  uint32 W   Sum wallbox charge power battery
      // 42  2  RO  uint32 W   Sum wallbox charge power grid
      // 50  2  RO  uint32 W   Sum inverter control values
      // 52  1  RO  uint16     Curtailment active
      const buffers: number[] = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1000,
        0,
        300,
        0,
        0,
        0,
        0,
        0,
        500,
        65535,
        64836,
        12
      ]

      getRawDataStub.onFirstCall().returns(Promise.resolve(buffers))

      const value = await subject.getData()

      assert.deepStrictEqual(value, {
        homeConsumptionWatts: 500,
        solarInputOutputsWatts: 300,
        batteryInputOutputWatts: -700,
        batteryChargePercentage: 12,
        inverterInputOutputWatts: 1000,
        gridInputOutputWatts: -500
      })
    })
  })
})
