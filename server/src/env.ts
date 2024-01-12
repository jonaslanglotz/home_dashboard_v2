import 'dotenv/config'
import { readEnv } from './env/readEnv'
import { str, int, optionalGroup } from './env/spec'

export const env = readEnv(process.env, {
  WEBSOCKET_SERVER_PORT: int(),

  PIRATE_WEATHER: optionalGroup({
    PIRATE_WEATHER_API_KEY: str(),
    PIRATE_WEATHER_LATITUDE: int(),
    PIRATE_WEATHER_LONGITUDE: int(),
    PIRATE_WEATHER_FETCH_INTERVAL: int()
  }),

  TODOIST: optionalGroup({
    TODOIST_API_KEY: str(),
    TODOIST_PROJECT_ID: str(),
    TODOIST_FETCH_INTERVAL: int()
  }),

  ICAL: optionalGroup({
    ICAL_CALENDAR_URL: str(),
    ICAL_EVENT_TIME_SPAN_DAYS: int(),
    ICAL_FETCH_INTERVAL: int()
  }),

  BVG: optionalGroup({
    BVG_STATION_ID: str(),
    BVG_DEPARTURE_TIME_SPAN_MINUTES: int(),
    BVG_FETCH_INTERVAL: int()
  }),

  TIBBER: optionalGroup({
    TIBBER_API_KEY: str(),
    TIBBER_FETCH_INTERVAL: int()
  }),

  KOSTAL: optionalGroup({
    KOSTAL_MODBUS_ADDRESS: str(),
    KOSTAL_MODBUS_PORT: int(),
    KOSTAL_FETCH_INTERVAL: int()
  })
})
