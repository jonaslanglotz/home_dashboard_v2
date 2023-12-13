import { env } from './env'
import { WebSocketServer } from 'ws'

console.log('Starting dashboard server...')

console.log(`Opening websocket server on :${env.WEBSOCKET_SERVER_PORT}`)
const webSocketServer = new WebSocketServer({ port: env.WEBSOCKET_SERVER_PORT })

webSocketServer.on('connection', (session) => {
  session.on('error', console.error)
})
