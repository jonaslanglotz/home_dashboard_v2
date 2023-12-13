import 'dotenv/config'
import { cleanEnv, num } from 'envalid'

export const env = cleanEnv(process.env, {
  WEBSOCKET_SERVER_PORT: num()
})
