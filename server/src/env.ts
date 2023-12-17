import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'

export const env = cleanEnv(process.env, {
  WEBSOCKET_SERVER_PORT: num(),

  PIRATE_WEATHER_API_KEY: str(),
  LATITUDE: num(),
  LONGITUDE: num(),

  TODOIST_API_KEY: str(),
  TODOIST_PROJECT_ID: str(),

  WEATHER_DATA_FETCH_INTERVAL: num(),
  TASKS_FETCH_INTERVAL: num()
})
