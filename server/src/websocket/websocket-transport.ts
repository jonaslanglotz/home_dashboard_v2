import { DataModel } from '../data/data-model'
import { env } from '../env'
import { logger } from '../utils/log'
import { WebSocketBroadcaster } from './websocket-broadcaster'

const log = logger.child({ module: 'websocket-transport' })

export function setupWebSocketBroadcast (dataModel: DataModel): void {
  const webSocketBroadcaster = new WebSocketBroadcaster({ port: env.WEBSOCKET_SERVER_PORT })
  webSocketBroadcaster.start()

  setupDataBroadcast(dataModel, webSocketBroadcaster)
  setupDataRetransmissionOnConnect(dataModel, webSocketBroadcaster)
}

function setupDataBroadcast (dataModel: DataModel, webSocketBroadcaster: WebSocketBroadcaster): void {
  dataModel.on(DataModel.DATA_EVENT, (type: string, data: any) => {
    webSocketBroadcaster.distributeMessage({ type, data })
  })
}

function setupDataRetransmissionOnConnect (dataModel: DataModel, webSocketBroadcaster: WebSocketBroadcaster): void {
  webSocketBroadcaster.on(WebSocketBroadcaster.NEW_CONNECTION_EVENT, (sendMessage) => {
    log.info('New WebSocket connection, retransmitting current data')
    const dataState = dataModel.currentState

    for (const [type, data] of Object.entries(dataState)) {
      if (data == null) { continue }
      sendMessage({ type, data })
    }
  })
}
