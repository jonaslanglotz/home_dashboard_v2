import { writable } from 'svelte/store'
import type { WeatherData, Events, TrainDepartures, Tasks } from '../../../shared-types'

export const weatherDataStore = writable<WeatherData | undefined>(undefined)
export const eventsStore = writable<Events | undefined>(undefined)
export const trainDeparturesStore = writable<TrainDepartures | undefined>(undefined)
export const tasksStore = writable<Tasks | undefined>(undefined)