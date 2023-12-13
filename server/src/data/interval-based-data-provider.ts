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
  dataProvider: DataProvider<T>

  _log: pino.Logger
  _isGettingData: boolean
  _timeout: NodeJS.Timeout

  /**
   * Creates an instance of IntervalBasedDataProvider.
   * @param {DataProvider<T>} dataProvider The DataProvider to get the data from.
   * @param {number} interval The period between data requests in milliseconds.
   * @memberof IntervalBasedDataProvider
   */
  constructor (dataProvider: DataProvider<T>, interval: number) {
    super()

    this.dataProvider = dataProvider

    this._log = logger.child({ module: this.constructor.name })
    this._isGettingData = false

    this._timeout = setInterval(() => {
      if (this._isGettingData) { return }

      this._isGettingData = true
      void this._getAndEmitData()
      this._isGettingData = false
    }, interval)
  }

  stop (): void {
    clearInterval(this._timeout)
  }

  async _getAndEmitData (): Promise<void> {
    try {
      const data = this.dataProvider.getData()
      this.emit('data', data)
    } catch (error) {
      this._log.error({ error }, `#getData of ${this.dataProvider.constructor.name} failed with error`)
    }
  }
}
