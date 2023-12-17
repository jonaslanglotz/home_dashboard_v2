import { EventEmitter } from 'node:events'
import { type DataProvider } from './data-provider'
import type pino from 'pino'
import { logger } from '../utils/log'

/**
 * Wrapper for a DataProvider, which calls the #getData method periodically and emits the data as a 'data' event.
 *
 * @export
 * @class IntervalBasedDataProvider
 * @extends {EventEmitter}
 * @template T
 */
export class IntervalBasedDataProvider<T> extends EventEmitter {
  static readonly DATA_EVENT = 'data'

  dataProvider: DataProvider<T>

  _log: pino.Logger
  _interval: number

  _isGettingData: boolean
  _timeout: NodeJS.Timeout | undefined

  /**
   * Creates an instance of IntervalBasedDataProvider.
   * @param {DataProvider<T>} dataProvider The DataProvider to get the data from.
   * @param {number} interval The period between data requests in milliseconds.
   * @memberof IntervalBasedDataProvider
   */
  constructor (dataProvider: DataProvider<T>, interval: number) {
    super()

    this.dataProvider = dataProvider

    this._interval = interval
    this._log = logger.child({ module: this.constructor.name })

    this._isGettingData = false
  }

  start (): void {
    this._getAndEmitData()
      .then(() => {
        this._timeout = setInterval(() => {
          if (this._isGettingData) { return }

          this._isGettingData = true
          void this._getAndEmitData()
          this._isGettingData = false
        }, this._interval)
      })
      .catch(error => {
        throw error
      })
  }

  stop (): void {
    clearInterval(this._timeout)
  }

  async _getAndEmitData (): Promise<void> {
    try {
      this._log.info(`Fetching data from ${this.dataProvider.constructor.name}`)
      const data = await this.dataProvider.getData()
      this.emit(IntervalBasedDataProvider.DATA_EVENT, data)
    } catch (error) {
      this._log.error({ error }, `#getData of ${this.dataProvider.constructor.name} failed with error`)
    }
  }
}
