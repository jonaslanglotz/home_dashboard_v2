import type pino from 'pino'
import { log } from './log'

export class WithLogger {
  readonly _log: pino.Logger

  constructor () {
    this._log = log.child({ module: this.constructor.name })
  }
}
