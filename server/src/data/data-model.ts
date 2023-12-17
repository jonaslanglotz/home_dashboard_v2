import { logger } from '../utils/log'

import { EventEmitter } from 'node:events'

import type pino from 'pino'
import { PirateWeatherDataProvider } from './data-providers/pirate-weather'
import { env } from '../env'
import { IntervalBasedDataProvider } from './interval-based-data-provider'
import { type WeatherData } from '../../../shared-types'

interface DataState {
  WEATHER: WeatherData | undefined
}

/**
 * Stores all DataProviders for the project, and forwards emitted events from each.
 *
 * @export
 * @class DataModel
 * @extends {EventEmitter}
 */
export class DataModel extends EventEmitter {
  static readonly DATA_EVENT = 'data'

  readonly _log: pino.Logger

  weatherProvider: IntervalBasedDataProvider<WeatherData> | undefined
  lastWeatherData: WeatherData | undefined

  constructor () {
    super()

    this._log = logger.child({ module: this.constructor.name })
  }

  start (): void {
    this._startWeatherProvider()
  }

  getCurrentState (): DataState {
    return {
      WEATHER: this.lastWeatherData
    }
  }

  _startWeatherProvider (): void {
    this.weatherProvider = new IntervalBasedDataProvider(
      new PirateWeatherDataProvider({
        apiKey: env.PIRATE_WEATHER_API_KEY,
        latitude: env.LATITUDE,
        longitude: env.LONGITUDE
      }),
      env.WEATHER_DATA_FETCH_INTERVAL * 1000
    )

    this.weatherProvider.on(IntervalBasedDataProvider.DATA_EVENT, data => {
      this.lastWeatherData = data
      this.emit(DataModel.DATA_EVENT, 'WEATHER', data)
    })

    this.weatherProvider.start()
  }
}
