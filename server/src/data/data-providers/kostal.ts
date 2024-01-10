import { DataProvider } from '../data-provider'
import type { EnergyUseData } from '../../../../shared-types'

import ModbusRTU from 'modbus-serial'

interface Options {
  modbusAddress: string
  modbusPort: number
}

export class KostalEnergyUseDataProvider extends DataProvider<EnergyUseData> {
  _modbusAddress: string
  _modbusPort: number

  _modbusClient: ModbusRTU

  /**
   * Creates an instance of KostalEnergyUseProvider.
   * @param {Options} options
   * @memberof KostalEnergyUseProvider
   */
  constructor (options: Options) {
    super()

    this._modbusAddress = options.modbusAddress
    this._modbusPort = options.modbusPort

    this._modbusClient = new ModbusRTU()
  }

  async getData (): Promise<EnergyUseData> {
    const rawData = await this._getRawData()
    return this._parseRawData(rawData)
  }

  async _getRawData (): Promise<number[]> {
    if (!this._modbusClient.isOpen) {
      await this._modbusClient.connectTCP('192.168.178.49', { port: 502 })
      this._modbusClient.setID(1)
    }

    const data = await this._modbusClient.readInputRegisters(40960, 26)
    return data.data
  }

  _parseRawData (rawData: number[]): EnergyUseData {
    const inverterInputOutputWatts = this._int32(rawData.slice(14, 16))
    const solarInputOutputsWatts = this._uint32(rawData.slice(16, 18))
    const homeConsumptionWatts = this._int32(rawData.slice(22, 24))
    const batteryInputOutputWatts = this._int32(rawData.slice(24, 26))
    const batteryChargePercentage = this._uint16(rawData[26])

    return {
      homeConsumptionWatts,
      solarInputOutputsWatts,
      batteryInputOutputWatts,
      batteryChargePercentage,
      inverterInputOutputWatts,
      gridInputOutputWatts: homeConsumptionWatts - inverterInputOutputWatts
    }
  }

  _string (registers: number[]): string {
    return registers
      .flatMap(register => [(register & 0b1111111100000000) >> 8, register & 0b11111111])
      .map(charPoint => String.fromCharCode(charPoint))
      .join('')
  }

  _int32 (registers: number[]): number {
    const bits = registers
      .slice(0, 2)
      .flatMap(register => register.toString(2))
      .join('')

    // Check for two's complement
    if (bits[0] === '0') {
      return parseInt(bits, 2)
    }

    return -(~parseInt(bits, 2) + 1)
  }

  _uint32 (registers: number[]): number {
    return (this._int32(registers) << 32 >> 32)
  }

  _uint16 (register: number): number {
    return register >> 0
  }
}
