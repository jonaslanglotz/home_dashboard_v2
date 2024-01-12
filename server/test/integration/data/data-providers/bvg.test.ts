import 'dotenv/config'

import { BvgTrainDeparturesProvider } from '../../../../src/data/data-providers/bvg'
import { log } from '../../../../src/utils/log'
import { readEnv, str, int } from '../../../../src/env/'

const env = readEnv(process.env, {
  BVG_STATION_ID: str(),
  BVG_DEPARTURE_TIME_SPAN_MINUTES: int()
})

describe('BvgTrainDeparturesProvider', function () {
  let subject: BvgTrainDeparturesProvider

  beforeEach('setup', () => {
    subject = new BvgTrainDeparturesProvider({
      stationId: env.BVG_STATION_ID,
      departureTimeSpanMinutes: env.BVG_DEPARTURE_TIME_SPAN_MINUTES
    })
  })

  describe('#_getRawDepartures()', function () {
    it('should not throw an Error', async function () {
      this.timeout(5000)
      const value = await subject._getRawDepartures()
      log.info({ value })
    })
  })
})
