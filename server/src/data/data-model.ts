import { logger } from '../utils/log'

import { EventEmitter } from 'node:events'

import type pino from 'pino'

/**
 * Stores all DataProviders for the project, and forwards emitted events from each.
 *
 * @export
 * @class DataModel
 * @extends {EventEmitter}
 */
export class DataModel extends EventEmitter {
  readonly _log: pino.Logger

  constructor () {
    super()

    this._log = logger.child({ module: this.constructor.name })
  }
}
