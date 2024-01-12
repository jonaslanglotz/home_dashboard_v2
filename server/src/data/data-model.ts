import { logger } from '../utils/log'

import { EventEmitter } from 'node:events'

import type pino from 'pino'
import { env } from '../env'
import { IntervalBasedDataProvider } from './interval-based-data-provider'
import { type TrainDepartures, type Events, type Tasks, type WeatherData, type EnergyPrices } from '../../../shared-types'

import * as PirateWeatherDataProvider from './data-providers/pirate-weather'
import * as TodoistTasksProvider from './data-providers/todoist'
import * as IcalEventsProvider from './data-providers/ical'
import * as BvgTrainDeparturesProvider from './data-providers/bvg'
import * as TibberEnergyPricesProvider from './data-providers/tibber'
import * as KostalEnergyUseDataProvider from './data-providers/kostal'

interface DataState {
  WEATHER?: WeatherData
  TASKS?: Tasks
  EVENTS?: Events
  TRAIN_DEPARTURES?: TrainDepartures
  ENERGY_PRICES?: EnergyPrices
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

    this.dataProviders = this._createDataProviders()

    this._connectDataProviders()
  }

  _createDataProviders (): Record<string, IntervalBasedDataProvider<any>> {
    const dataProviders: Record<string, IntervalBasedDataProvider<any>> = {}

    if (env.PIRATE_WEATHER !== undefined) {
      dataProviders.WEATHER = new IntervalBasedDataProvider(
        PirateWeatherDataProvider.fromEnv(env.PIRATE_WEATHER),
        env.PIRATE_WEATHER.PIRATE_WEATHER_FETCH_INTERVAL * 1000
      )
    }

    if (env.TODOIST !== undefined) {
      dataProviders.TASKS = new IntervalBasedDataProvider(
        TodoistTasksProvider.fromEnv(env.TODOIST),
        env.TODOIST.TODOIST_FETCH_INTERVAL * 1000
      )
    }

    if (env.ICAL !== undefined) {
      dataProviders.EVENTS = new IntervalBasedDataProvider(
        IcalEventsProvider.fromEnv(env.ICAL),
        env.ICAL.ICAL_FETCH_INTERVAL * 1000
      )
    }

    if (env.BVG !== undefined) {
      dataProviders.TRAIN_DEPARTURES = new IntervalBasedDataProvider(
        BvgTrainDeparturesProvider.fromEnv(env.BVG),
        env.BVG.BVG_FETCH_INTERVAL * 1000
      )
    }

    if (env.TIBBER !== undefined) {
      dataProviders.ENERGY_PRICES = new IntervalBasedDataProvider(
        TibberEnergyPricesProvider.fromEnv(env.TIBBER),
        env.TIBBER.TIBBER_FETCH_INTERVAL * 1000
      )
    }

    if (env.KOSTAL !== undefined) {
      dataProviders.ENERGY_USE_DATA = new IntervalBasedDataProvider(
        KostalEnergyUseDataProvider.fromEnv(env.KOSTAL),
        env.KOSTAL.KOSTAL_FETCH_INTERVAL * 1000
      )
    }

    return dataProviders
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
