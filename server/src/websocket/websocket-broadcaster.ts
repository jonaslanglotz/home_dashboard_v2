import { env } from '../env'

import { type WebSocket, WebSocketServer, EventEmitter } from 'ws'
import { logger } from '../utils/log'
import type pino from 'pino'

/**
 * A WebSocket server that can broadcast messages to all connected clients.
 *
 * @export
 * @class WebSocketBroadcaster
 * @extends {WithLogger}
 * @extends {EventEmitter}
 */
export class WebSocketBroadcaster extends EventEmitter {
  static readonly NEW_CONNECTION_EVENT: 'NEW_CONNECTION_EVENT'

  port: number

  #server: WebSocketServer | undefined
  readonly #sessions: WebSocket[] = []
  _log: pino.Logger

  /**
   * Creates an instance of WebSocketBroadcaster.
   * @param { Object } options
   * @param { Number } options.port     Port on which the WebSocketServer should listen
   * @memberof WebSocketBroadcaster
   */
  constructor (options: { port: number }) {
    super()

    this.port = options.port

    this._log = logger.child({ module: this.constructor.name })
  }

  /**
   * Starts the underlying WebSocketServer, so that it is open for connections.
   *
   * @memberof WebSocketBroadcaster
   */
  start (): void {
    this._log.info(`Opening websocket server on :${env.WEBSOCKET_SERVER_PORT}`)
    this.#server = new WebSocketServer({ port: env.WEBSOCKET_SERVER_PORT })
    this.#registerServerEventHandlers()
  }

  /**
   * Stops the underlying WebSocketServer, closing all connections.
   *
   * @memberof WebSocketBroadcaster
   */
  stop (): void {
    if (this.#server == null) { return }

    this.#server.close()
  }

  /**
   * Distribute a message to all open websocket connections.
   *
   * @param {Object} message
   * @memberof WebSocketBroadcaster
   */
  distributeMessage (message: Record<string, any>): void {
    this._log.info(`Distributing message to ${this.#sessions.length} websocket connections`)
    const stringifiedMessage = JSON.stringify(message)
    this.#sessions.forEach(session => {
      session.send(stringifiedMessage)
    })
  }

  #registerServerEventHandlers (): void {
    if (this.#server == null) { return }

    this.#server.on('connection', (session) => {
      session.on('error', error => {
        this._log.error({ error }, 'Error from websocket connection')
      })

      session.on('close', () => {
        const sessionIndex = this.#sessions.indexOf(session)

        if (sessionIndex >= 0) { this.#sessions.splice(sessionIndex, 1) }
      })

      this.#sessions.push(session)

      this.emit(WebSocketBroadcaster.NEW_CONNECTION_EVENT, (message: any) => { session.send(JSON.stringify(message)) })
    })
  }
}
