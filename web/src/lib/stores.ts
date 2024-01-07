import { writable } from 'svelte/store'
import type { WeatherData } from '../../../shared-types'

export const weatherDataStore = writable<WeatherData | undefined>(undefined)