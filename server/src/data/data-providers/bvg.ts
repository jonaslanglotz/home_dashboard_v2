import { DataProvider } from '../data-provider'
import type { TrainDeparture, TrainDepartures } from '../../../../shared-types'

// @ts-expect-error as this is a bug in typescript, see https://github.com/microsoft/TypeScript/issues/54523
import type { Alternative, HafasClient, Profile } from 'hafas-client'

interface Options {
  stationId: string
  departureTimeSpanMinutes: number
}

const Hafas = import('hafas-client')
const bvgProfile = import('hafas-client/p/bvg/index.js')

export class BvgTrainDeparturesProvider extends DataProvider<TrainDepartures> {
  stationId: string
  departureTimeSpanMinutes: number

  _hafasClient: Promise<HafasClient>
  /**
   * Creates an instance of BvgTrainDeparturesProvider.
   * @param {Options} options
   * @param {String} options.stationId The id of the station to get departures for.
   * @param {String} options.departureTimeSpanMinutes The time span to get departures for in minutes.
   * @memberof BvgTrainDeparturesProvider
   */
  constructor (options: Options) {
    super()

    this.stationId = options.stationId
    this.departureTimeSpanMinutes = options.departureTimeSpanMinutes

    this._hafasClient = Hafas.then(async (hafas) => hafas.createClient((await bvgProfile).profile as Profile, 'home_dashboard'))
  }

  async getData (): Promise<TrainDepartures> {
    const rawDepartures = [...await this._getRawDepartures()]
    const validDepartures = this._filterValidDepartures(rawDepartures)

    const departures = validDepartures
      .map(rawDeparture => this._convertRawDeparture(rawDeparture))
      .flatMap(departure => departure == null ? [] : [departure])

    const sortedDepartures = departures.sort((a, b) => (
      a.plannedTime.localeCompare(b.plannedTime)
    ))

    return sortedDepartures
  }

  async _getRawDepartures (): Promise<readonly Alternative[]> {
    return (await (await this._hafasClient).departures(this.stationId, { duration: this.departureTimeSpanMinutes, language: 'de' })).departures
  }

  _filterValidDepartures (rawDepartures: Alternative[]): Alternative[] {
    return rawDepartures.filter(rawDeparture => {
      // Filter out departures with missing values
      if (rawDeparture.destination?.name == null) { return false }
      if (rawDeparture.direction == null) { return false }
      if (rawDeparture.line?.name == null) { return false }
      if (rawDeparture.when == null) { return false }
      if (rawDeparture.plannedWhen == null) { return false }

      // Find all departures matching the current one, including the current one
      const similarDepartures = rawDepartures.filter(innerRawDeparture => this._rawDeparturesEqual(rawDeparture, innerRawDeparture))

      // This is the only departure, so it is valid
      if (similarDepartures.length === 1) { return true }

      // There are only multiple departures with the same description
      // if one of them is a cancellation, with a '.when' of undefined.
      // In this case, we only include the one with the undefined value,
      // to indicate a cancelled train.
      return rawDeparture.when === undefined
    })
  }

  _rawDeparturesEqual (a: Alternative, b: Alternative): boolean {
    return a.destination?.name === b.destination?.name &&
         a.direction === b.direction &&
         a.line?.name === b.line?.name &&
         a.plannedWhen === b.plannedWhen
  }

  _convertRawDeparture (rawDeparture: Alternative): TrainDeparture | undefined {
    if (rawDeparture.destination?.name == null) { return undefined }
    if (rawDeparture.direction == null) { return undefined }
    if (rawDeparture.line?.name == null) { return undefined }
    if (rawDeparture.when == null) { return undefined }
    if (rawDeparture.plannedWhen == null) { return undefined }

    return {
      destination: rawDeparture.destination.name,
      direction: rawDeparture.direction,
      line: rawDeparture.line.name,
      time: rawDeparture.when,
      plannedTime: rawDeparture.plannedWhen
    }
  }
}

export interface EnvConfigurationValues {
  BVG_STATION_ID: string
  BVG_DEPARTURE_TIME_SPAN_MINUTES: number
}

export const fromEnv = (env: EnvConfigurationValues): BvgTrainDeparturesProvider => new BvgTrainDeparturesProvider({
  stationId: env.BVG_STATION_ID,
  departureTimeSpanMinutes: env.BVG_DEPARTURE_TIME_SPAN_MINUTES
})
