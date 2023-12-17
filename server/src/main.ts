// env verification should be done before everything else
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from './env'

import { log } from './utils/log'
import { DataModel } from './data/data-model'
import { setupWebSocketBroadcast } from './websocket/websocket-transport'

log.info('Starting dashboard server')

const dataModel = new DataModel()

setupWebSocketBroadcast(dataModel)

dataModel.start()
