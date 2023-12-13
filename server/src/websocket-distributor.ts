import { env } from './env'
import { WithLogger } from './utils/class-with-logger'

import { type WebSocket, WebSocketServer } from 'ws'

/**
 * A WebSocket server that can broadcast messages to all connected clients.
 *
 * @export
 * @class WebSocketBroadcaster
 * @extends {WithLogger}
 */
export class WebSocketBroadcaster extends WithLogger {
  port: number

  #server: WebSocketServer | undefined
  readonly #sessions: WebSocket[] = []

  /**
   * Creates an instance of WebSocketBroadcaster.
   * @param { Object } options
   * @param { Number } options.port     Port on which the WebSocketServer should listen
   * @memberof WebSocketBroadcaster
   */
  constructor (options: { port: number }) {
    super()

    this.port = options.port
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
    })
  }
}
