import { DataProvider } from '../data-provider'
import { DashboardError } from '../../utils/dashboard-error'
import { type EnergyPrices } from '../../../../shared-types'

interface Home {
  currentSubscription: {
    priceInfo: {
      today: PriceInfo[]
      tomorrow: PriceInfo[]
    }
  }
}

interface PriceInfo {
  startsAt: string
  total: number
}

export interface APIResponse {
  data?: {
    viewer: {
      homes: Home[]
    }
  }
}

interface Options {
  apiKey: string
}

export class TibberEnergyPricesProvider extends DataProvider<EnergyPrices> {
  API_URL = 'https://api.tibber.com/v1-beta/gql'

  QUERY = `
    { viewer { homes {
      currentSubscription{
        priceInfo{
          today {
            total
            startsAt
          }
          tomorrow {
            total
            startsAt
          }
        }
      }
    }}}
  `

  apiKey: string

  /**
   * Creates an instance of TibberEnergyPricesProvider.
   * @param {Object} options
   * @param {String} options.apiKey API key for the Tibber API.
   */
  constructor (options: Options) {
    super()

    this.apiKey = options.apiKey
  }

  async getData (): Promise<EnergyPrices> {
    const rawData = await this._getRawData()
    return this._convertRawData(rawData)
  }

  async _getRawData (): Promise<APIResponse> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: this.QUERY })
    })

    const text = await res.text()

    if (!res.ok) {
      throw new DashboardError('Received non-ok status from Tibber API', {
        status: res.status,
        body: text
      })
    }

    try {
      const data = JSON.parse(text)
      return data as APIResponse
    } catch (error) {
      throw new DashboardError('Could not parse JSON response from Tibber API', {
        error,
        body: text
      })
    }
  }

  _convertRawData (rawData: APIResponse): EnergyPrices {
    if (rawData.data == null) {
      throw new DashboardError('Tibber API response did not include any data', {
        rawData
      })
    }

    // Currently, only a subscription with one home is supported
    const priceInfo = rawData.data.viewer.homes[0].currentSubscription.priceInfo
    const rawEnergyPrices = priceInfo.today.concat(priceInfo.tomorrow)

    const energyPrices = rawEnergyPrices.map((rawEnergyPrice) =>
      ({
        time: rawEnergyPrice.startsAt,
        price: rawEnergyPrice.total
      })
    )

    return energyPrices
  }
}
