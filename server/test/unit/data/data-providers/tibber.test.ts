import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonStub } from 'sinon'
import { type APIResponse, TibberEnergyPricesProvider } from '../../../../src/data/data-providers/tibber'
import { DashboardError } from '../../../../src/utils/dashboard-error'
import { type EnergyPrices } from '../../../../../shared-types'

chai.use(chaiAsPromised)

describe('TibberEnergyPricesProvider', function () {
  const validAPIResponse: APIResponse = {
    data: {
      viewer: {
        homes: [{
          currentSubscription: {
            priceInfo: {
              today: Array.from({ length: 24 }, (_, i) => (
                { total: i, startsAt: new Date(i).toISOString() }
              )),
              tomorrow: Array.from({ length: 24 }, (_, i) => (
                { total: 24 + i, startsAt: new Date(24 + i).toISOString() }
              ))
            }
          }
        }]
      }
    }
  }

  const energyPrices: EnergyPrices = Array.from({ length: 48 }, (_, i) => ({
    time: new Date(i).toISOString(),
    price: i
  }))

  async function positiveResponse (): Promise<Response> {
    return new Response(
      JSON.stringify(validAPIResponse),
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  }

  async function invalidResponse (): Promise<Response> {
    return new Response(
      'not json',
      {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }
    )
  }

  async function negativeResponse (): Promise<Response> {
    return new Response(
      'Bad request',
      {
        status: 400
      }
    )
  }

  let subject: TibberEnergyPricesProvider
  let fetchStub: SinonStub

  beforeEach('setup', () => {
    subject = new TibberEnergyPricesProvider({
      apiKey: 'apiKey'
    })

    fetchStub = sinon.stub(global, 'fetch')
  })

  afterEach(function () {
    fetchStub.restore()
  })

  describe('#getData', function () {
    it('should return the correct EnergyPrices when the configuration is valid', async function () {
      fetchStub.onFirstCall().returns(positiveResponse())

      const value = await subject.getData()

      assert.deepStrictEqual(value, energyPrices)
    })
  })

  describe('#_getRawData', function () {
    it('should correctly parse the response', async function () {
      fetchStub.onFirstCall().returns(positiveResponse())

      const value = await subject._getRawData()

      assert.deepEqual(value, validAPIResponse)
    })

    it('should throw an error when the response is not ok', async function () {
      fetchStub.onFirstCall().returns(negativeResponse())

      await assert.isRejected(
        subject._getRawData(),
        DashboardError
      )
    })

    it('should throw an error when the response is invalid JSON', async function () {
      fetchStub.onFirstCall().returns(invalidResponse())

      await assert.isRejected(
        subject._getRawData(),
        DashboardError
      )
    })
  })

  describe('#_convertRawData', function () {
    it('should raise an error when required data is missing', function () {
      const invalidAPIResponse: APIResponse = { }
      assert.throw(() => subject._convertRawData(invalidAPIResponse), DashboardError)
    })
  })
})
