import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import { logger } from '../../utils/log'

export type PresenceState = 'home' | 'not_home' | 'unknown'

interface Options {
  url: string
  token: string
  entityId: string
}

interface HassMessage {
  id?: number
  type: string
  event?: {
    event_type: string
    data: {
      entity_id?: string
      new_state?: {
        state?: string
      }
    }
  }
  success?: boolean
  result?: Array<{ entity_id?: string, state?: string }>
}

export class HomeAssistantPresenceClient extends EventEmitter {
  static readonly PRESENCE_EVENT = 'presence'

  private readonly options: Options
  private readonly log = logger.child({ module: this.constructor.name })
  private ws: WebSocket | undefined
  private reconnectTimeout: NodeJS.Timeout | undefined
  private reconnectDelayMs = 1000
  private readonly maxReconnectDelayMs = 30000
  private shouldReconnect = false
  private nextMessageId = 1
  private pendingInitialStateRequestId: number | undefined

  constructor (options: Options) {
    super()
    this.options = options
  }

  start (): void {
    if (this.shouldReconnect) { return }
    this.shouldReconnect = true
    this._connect()
  }

  stop (): void {
    this.shouldReconnect = false
    clearTimeout(this.reconnectTimeout)
    this.ws?.terminate()
    this.ws = undefined
  }

  private _connect (): void {
    this.log.info('Connecting to Home Assistant websocket endpoint')
    if (this.ws !== undefined) {
      this.ws.removeAllListeners()
    }

    this.ws = new WebSocket(this.options.url)
    this.ws.on('open', () => {
      this.log.info('Opened websocket connection to Home Assistant')
    })
    this.ws.on('message', (data: WebSocket.RawData) => {
      this._handleMessage(data.toString())
    })
    this.ws.on('close', () => {
      this.log.warn('Home Assistant websocket connection closed')
      this._scheduleReconnect()
    })
    this.ws.on('error', (error) => {
      this.log.error({ error }, 'Home Assistant websocket reported an error')
    })
  }

  private _scheduleReconnect (): void {
    if (!this.shouldReconnect) { return }
    clearTimeout(this.reconnectTimeout)
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, this.maxReconnectDelayMs)
      this._connect()
    }, this.reconnectDelayMs)
  }

  private _resetReconnectDelay (): void {
    this.reconnectDelayMs = 1000
  }

  private _handleMessage (raw: string): void {
    try {
      const message = JSON.parse(raw) as HassMessage
      switch (message.type) {
        case 'auth_required':
          this._send({ type: 'auth', access_token: this.options.token })
          break
        case 'auth_ok':
          this.log.info('Authenticated with Home Assistant websocket API')
          this._resetReconnectDelay()
          this._requestInitialState()
          this._subscribeToStateChanges()
          break
        case 'auth_invalid':
          this.log.error('Home Assistant authentication failed, will not reconnect automatically')
          this.stop()
          break
        case 'event':
          this._handleEvent(message)
          break
        case 'result':
          this._handleResult(message)
          break
        default:
          break
      }
    } catch (error) {
      this.log.error({ error, raw }, 'Failed to handle Home Assistant message')
    }
  }

  private _requestInitialState (): void {
    if (this.ws == null) { return }
    const id = this._nextMessageId()
    this.pendingInitialStateRequestId = id
    this._send({ id, type: 'get_states' })
  }

  private _subscribeToStateChanges (): void {
    const id = this._nextMessageId()
    this._send({
      id,
      type: 'subscribe_events',
      event_type: 'state_changed'
    })
  }

  private _handleEvent (message: HassMessage): void {
    if (message.event?.event_type !== 'state_changed') { return }
    if (message.event.data?.entity_id !== this.options.entityId) { return }
    const state = message.event.data.new_state?.state
    this._emitPresenceState(state)
  }

  private _handleResult (message: HassMessage): void {
    if (message.id == null || message.id !== this.pendingInitialStateRequestId) { return }
    this.pendingInitialStateRequestId = undefined
    if (Array.isArray(message.result)) {
      const match = message.result.find(entry => entry?.entity_id === this.options.entityId)
      if (match != null) {
        this._emitPresenceState(match.state)
      }
    }
  }

  private _emitPresenceState (rawState: string | undefined): void {
    const normalized = this._normalizePresenceState(rawState)
    this.emit(HomeAssistantPresenceClient.PRESENCE_EVENT, normalized)
  }

  private _normalizePresenceState (state: string | undefined): PresenceState {
    if (state === 'home') { return 'home' }
    if (state === 'not_home') { return 'not_home' }
    return 'unknown'
  }

  private _send (payload: Record<string, any>): void {
    if (this.ws == null) { return }
    this.ws.send(JSON.stringify(payload))
  }

  private _nextMessageId (): number {
    return this.nextMessageId++
  }
}
