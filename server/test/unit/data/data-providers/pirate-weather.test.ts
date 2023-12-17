import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonStub } from 'sinon'
import { type APIResponse, PirateWeatherDataProvider } from '../../../../src/data/data-providers/pirate-weather'
import { DashboardError } from '../../../../src/utils/dashboard-error'
import { type WeatherData } from '../../../../../shared-types'

chai.use(chaiAsPromised)

describe('PirateWeatherDataProvider', function () {
  const validAPIResponse: APIResponse = {
    // @ts-expect-error Non complete, only required info
    currently: {
      icon: 'cloudy',
      temperature: 20
    },
    hourly: {
      // @ts-expect-error Non complete, only required info
      data: Array.from({ length: 48 }, (_, i) => ({
        time: i,
        temperature: i,
        precipAccumulation: i
      }))
    }
  }

  const weatherData: WeatherData = {
    temperature: 20,
    icon: 'cloudy',
    hourly: Array.from({ length: 24 }, (_, i) => ({
      timestamp: i,
      temperature: i,
      precipitation: i
    })),
    highTemperature: 23,
    lowTemperature: 0
  }

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

  let subject: PirateWeatherDataProvider
  let fetchStub: SinonStub

  beforeEach('setup', () => {
    subject = new PirateWeatherDataProvider({
      apiKey: 'apikey',
      latitude: 10.1,
      longitude: -5.5
    })

    fetchStub = sinon.stub(global, 'fetch')
  })

  afterEach(function () {
    fetchStub.restore()
  })

  describe('#getData', function () {
    it('should return the correct WeatherData when the configuration is valid', async function () {
      fetchStub.onFirstCall().returns(positiveResponse())

      const value = await subject.getData()

      assert.deepStrictEqual(value, weatherData)
    })
  })

  describe('#_getRawData', function () {
    it('should send the correct paramters in the request url', function () {
      fetchStub.onFirstCall().returns(positiveResponse())

      void subject._getRawData()

      assert(fetchStub.calledOnceWith('https://api.pirateweather.net/forecast/apikey/10.1,-5.5?units=si&exclude=minutely'))
    })

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
      const invalidAPIResponse = { ...validAPIResponse } as any
      invalidAPIResponse.hourly = undefined
      assert.throw(() => subject._convertRawData(invalidAPIResponse as APIResponse), DashboardError)
    })
  })
})
