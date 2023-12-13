// env verification should be done before everything else
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from './env'

import { log } from './utils/log'
import { WebSocketBroadcaster } from './websocket-distributor'
import { DataModel } from './data/data-model'

log.info('Starting dashboard server')

const webSocketDistributor = new WebSocketBroadcaster({ port: env.WEBSOCKET_SERVER_PORT })
webSocketDistributor.start()

const dataModel = new DataModel()
dataModel.on('data', (type: string, data: any) => {
  webSocketDistributor.distributeMessage({ type, data })
})
