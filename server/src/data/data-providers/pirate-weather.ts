import { DataProvider } from '../data-provider'
import { type WeatherIconIdentifier, type WeatherData } from '../../../../shared-types'
import { DashboardError } from '../../utils/dashboard-error'

interface Options {
  apiKey: string
  latitude: number
  longitude: number
}

export interface APIResponse {
  latitude: number
  longitude: number
  timezone: string
  offset: number
  elevation: number
  currently: {
    time: number
    summary: string
    icon: string
    nearestStormDistance: number
    nearestStormBearing: number
    precipIntensity: number
    precipProbability: number
    precipIntensityError: number
    precipType: string
    temperature: number
    apparentTemperature: number
    dewPoint: number
    humidity: number
    pressure: number
    windSpeed: number
    windGust: number
    windBearing: number
    cloudCover: number
    uvIndex: number
    visibility: number
    ozone: number
  }
  hourly: {
    summary: string
    icon: string
    data: Array<{
      time: number
      icon: string
      summary: string
      precipIntensity: number
      precipProbability: number
      precipIntensityError: number
      precipAccumulation: number
      precipType: string
      temperature: number
      apparentTemperature: number
      dewPoint: number
      humidity: number
      pressure: number
      windSpeed: number
      windGust: number
      windBearing: number
      cloudCover: number
      uvIndex: number
      visibility: number
      ozone: number
    }>
  }
  daily: {
    summary: string
    icon: string
    data: Array<{
      time: number
      icon: string
      summary: string
      sunriseTime: number
      sunsetTime: number
      moonPhase: number
      precipIntensity: number
      precipIntensityMax: number
      precipIntensityMaxTime: number
      precipProbability: number
      precipAccumulation: number
      precipType: string
      temperatureHigh: number
      temperatureHighTime: number
      temperatureLow: number
      temperatureLowTime: number
      apparentTemperatureHigh: number
      apparentTemperatureHighTime: number
      apparentTemperatureLow: number
      apparentTemperatureLowTime: number
      dewPoint: number
      humidity: number
      pressure: number
      windSpeed: number
      windGust: number
      windGustTime: number
      windBearing: number
      cloudCover: number
      uvIndex: number
      uvIndexTime: number
      visibility: number
      temperatureMin: number
      temperatureMinTime: number
      temperatureMax: number
      temperatureMaxTime: number
      apparentTemperatureMin: number
      apparentTemperatureMinTime: number
      apparentTemperatureMax: number
      apparentTemperatureMaxTime: number
    }>
  }
  flags: {
    sources: string[]
    sourceTimes: Record<string, string>
    'nearest-station': number
    units: string
    version: string
  }
}

export class PirateWeatherDataProvider extends DataProvider<WeatherData> {
  API_URL = 'https://api.pirateweather.net'

  apiKey: string
  latitude: number
  longitude: number

  /**
   * Creates an instance of PirateWeatherDataProvider.
   * @param {Object} options
   * @param {String} options.apiKey API key for the pirate weather API.
   * @param {String} options.latitude Latitude of the location for which to fetch weather forecasts
   * @param {String} options.longitude Longitude of the location for which to fetch weather forecasts
   * @memberof PirateWeatherDataProvider
   */
  constructor (options: Options) {
    super()

    this.apiKey = options.apiKey
    this.latitude = options.latitude
    this.longitude = options.longitude
  }

  async getData (): Promise<WeatherData> {
    const rawData = await this._getRawData()
    return this._convertRawData(rawData)
  }

  async _getRawData (): Promise<APIResponse> {
    const url = `${this.API_URL}/forecast/${this.apiKey}/${this.latitude},${this.longitude}?units=si&exclude=minutely`
    const res = await fetch(url)

    const text = await res.text()

    if (res.status !== 200) {
      throw new DashboardError('Received non-ok status from PirateWeather API', {
        status: res.status,
        body: text
      })
    }

    try {
      const data = JSON.parse(text)
      return data as APIResponse
    } catch (error) {
      throw new DashboardError('Could not parse JSON response from PirateWeather API', {
        error,
        body: text
      })
    }
  }

  _convertRawData (rawData: APIResponse): WeatherData {
    try {
      const relevantHourlyData = rawData.hourly.data.slice(0, 24)
      return {
        temperature: rawData.currently.temperature,
        icon: rawData.currently.icon as WeatherIconIdentifier,
        hourly: relevantHourlyData.map(hourlyRawData => ({
          timestamp: hourlyRawData.time,
          temperature: hourlyRawData.temperature,
          precipitation: hourlyRawData.precipAccumulation
        })),
        highTemperature: Math.max(...relevantHourlyData.map(hourlyRawData => hourlyRawData.temperature)),
        lowTemperature: Math.min(...relevantHourlyData.map(hourlyRawData => hourlyRawData.temperature))
      }
    } catch (error) {
      throw new DashboardError('Could not convert PirateWeather APIResponse to WeatherData object', { rawData })
    }
  }
}
