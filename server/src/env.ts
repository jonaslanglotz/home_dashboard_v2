import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'

export const env = cleanEnv(process.env, {
  WEBSOCKET_SERVER_PORT: num(),
  PIRATE_WEATHER_API_KEY: str(),
  LATITUDE: num(),
  LONGITUDE: num(),
  WEATHER_DATA_FETCH_INTERVAL: num()
})
