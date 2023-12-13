import type pino from 'pino'
import { log } from '../log'

export class WithLogger {
  log: pino.Logger

  constructor () {
    this.log = log.child({ module: this.constructor.name })
  }
}
