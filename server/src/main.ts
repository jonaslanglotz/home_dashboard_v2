// env verification should be done before everything else
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from './env'

import { log } from './log'
import { DashboardWebSocketServer } from './web-socket-server/web-socket-server'

log.info('Starting dashboard server')

const webSocketServer = new DashboardWebSocketServer({ port: env.WEBSOCKET_SERVER_PORT })
webSocketServer.start()
