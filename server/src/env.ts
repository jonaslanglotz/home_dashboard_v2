import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'

export const env = cleanEnv(process.env, {
  WEBSOCKET_SERVER_PORT: num(),

  PIRATE_WEATHER_API_KEY: str(),
  LATITUDE: num(),
  LONGITUDE: num(),

  TODOIST_API_KEY: str(),
  TODOIST_PROJECT_ID: str(),

  ICAL_CALENDAR_URL: str(),
  ICAL_EVENT_TIME_SPAN_DAYS: num(),

  BVG_STATION_ID: str(),
  BVG_DEPARTURE_TIME_SPAN_MINUTES: num(),

  WEATHER_DATA_FETCH_INTERVAL: num(),
  TASKS_FETCH_INTERVAL: num(),
  EVENTS_FETCH_INTERVAL: num(),
  TRAIN_DEPARTURES_FETCH_INTERVAL: num()
})
