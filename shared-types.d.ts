export type WeatherIconIdentifier = 'clear-day' | 'clear-night' | 'rain' | 'snow' | 'sleet' | 'wind' | 'fog' | 'cloudy' | 'partly-cloudy-day' | 'partly-cloudy-night.'

export interface WeatherData {
  temperature: number,
  icon: WeatherIconIdentifier,
  hourly: {
    timestamp: number,
    temperature: number,
    precipitation: number
  }[],
  highTemperature: number,
  lowTemperature: number
}

export interface Task {
  title: string
  due?: string
  priority: number
}

export type Tasks = Task[]

export interface Event {
  name: string
  date: string
  hasTime: boolean
}

export type Events = Event[]
