import { logger } from '../utils/log'

import { EventEmitter } from 'node:events'

import type pino from 'pino'
import { PirateWeatherDataProvider } from './data-providers/pirate-weather'
import { env } from '../env'
import { IntervalBasedDataProvider } from './interval-based-data-provider'
import { type Tasks, type WeatherData } from '../../../shared-types'
import { TodoistTasksProvider } from './data-providers/todoist'

interface DataState {
  WEATHER?: WeatherData
  TASKS?: Tasks
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

  currentState: DataState = {}

  dataProviders: Record<keyof DataState, IntervalBasedDataProvider<any>>

  constructor () {
    super()

    this._log = logger.child({ module: this.constructor.name })

    this.dataProviders = {
      WEATHER: new IntervalBasedDataProvider(
        new PirateWeatherDataProvider({
          apiKey: env.PIRATE_WEATHER_API_KEY,
          latitude: env.LATITUDE,
          longitude: env.LONGITUDE
        }),
        env.WEATHER_DATA_FETCH_INTERVAL * 1000
      ),
      TASKS: new IntervalBasedDataProvider(
        new TodoistTasksProvider({
          apiKey: env.TODOIST_API_KEY,
          projectId: env.TODOIST_PROJECT_ID
        }),
        env.TASKS_FETCH_INTERVAL * 1000
      )
    }

    this._connectDataProviders()
  }

  start (): void {
    Object.values(this.dataProviders).forEach(dataProvider => { dataProvider.start() })
  }

  _connectDataProviders (): void {
    for (const [type, dataProvider] of Object.entries(this.dataProviders)) {
      dataProvider.on(IntervalBasedDataProvider.DATA_EVENT, data => {
        this.currentState[type as keyof typeof this.dataProviders] = data
        this.emit(DataModel.DATA_EVENT, type, data)
      })
    }
  }
}
