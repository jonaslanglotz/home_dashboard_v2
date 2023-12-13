import { env } from '../env'
import { WithLogger } from '../utils/class-with-logger'

import { WebSocketServer } from 'ws'

export class DashboardWebSocketServer extends WithLogger {
  port: number
  #server: WebSocketServer | undefined

  constructor (options: { port: number }) {
    super()

    this.port = options.port
  }

  start (): void {
    this.log.info(`Opening websocket server on :${env.WEBSOCKET_SERVER_PORT}`)
    this.#server = new WebSocketServer({ port: env.WEBSOCKET_SERVER_PORT })
    this.#defineBehaviour()
  }

  stop (): void {
    if (this.#server == null) { return }

    this.#server.close()
  }

  #defineBehaviour (): void {
    if (this.#server == null) { return }

    this.#server.on('connection', (session) => {
      session.on('error', error => {
        this.log.error({ error }, 'Error from websocket connection')
      })
    })
  }
}
