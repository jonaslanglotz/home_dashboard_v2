import { PUBLIC_SERVER_HOST, PUBLIC_SERVER_WS_PORT } from '$env/static/public'

interface MessageCandidate {
  type: unknown,
  data: unknown
}

interface Message {
  type: string,
  data: unknown
}

function isMessageCandidate(message: unknown): message is MessageCandidate {
  if (message == null) { return false }
  if (!(message instanceof Object)) { return false }
  if (!('type' in message)) { return false }
  if (!('data' in message)) { return false }

  return true
}

function isMessage(message: unknown): message is Message {
  if (!isMessageCandidate(message)) { return false }

  if ((message.type == null)) { return false }
  if (!(typeof message.type === 'string')) { return false }
  if ((message.data == null)) { return false }

  return true
}

export class WSConnection extends EventTarget {
  _ws: WebSocket | undefined
  ready = false

  constructor() {
    super()
    this.startConnectionLoop()
  }

  async startConnectionLoop(): Promise<void> {
    for (;;) {
      this._ws = new WebSocket(`ws://${PUBLIC_SERVER_HOST}:${PUBLIC_SERVER_WS_PORT}`)
      await this.handleConnection()
      console.log('Lost connection with websocket server trying to reestablish.')
    }
  }

  handleConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._ws == null) {
        reject()
        return
      }

      this._ws.onopen = () => {
        console.log('Established connection with websocket server, waiting for messages.')
        this.ready = true

        this.dispatchEvent(new Event('READY'))
      }

      this._ws.onmessage = (event) => {
        this.handleMessage(event)
      }

      this._ws.onclose = () => {
        this.ready = false
        this._ws = undefined
        resolve()
      }

    })
  }

  handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data.toString())
      if (!isMessage(message)) {
        console.error('Received invalid message:', message)
      }

      console.debug(`Received '${message.type}' message from websocket server`, message.data)
      this.dispatchEvent(new CustomEvent(message.type, { detail: { data: message.data } }))
    } catch (error) {
      console.error('Could not parse message:', event, error)
    }
  }
}