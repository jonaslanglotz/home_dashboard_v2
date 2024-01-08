import { writable } from 'svelte/store'
import type { Events, WeatherData } from '../../../shared-types'

export const weatherDataStore = writable<WeatherData | undefined>(undefined)
export const eventsStore = writable<Events | undefined>(undefined)