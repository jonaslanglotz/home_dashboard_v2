import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon, { type SinonStub } from 'sinon'
import { BvgTrainDeparturesProvider } from '../../../../src/data/data-providers/bvg'
// @ts-expect-error as this is a bug in typescript, see https://github.com/microsoft/TypeScript/issues/54523
import { type Alternative } from 'hafas-client'

chai.use(chaiAsPromised)

describe('BvgTrainDeparturesProvider', function () {
  let subject: BvgTrainDeparturesProvider
  let rawDeparturesStub: SinonStub

  beforeEach('setup', () => {
    subject = new BvgTrainDeparturesProvider({
      stationId: 'stationId',
      departureTimeSpanMinutes: 120
    })

    rawDeparturesStub = sinon.stub(subject, '_getRawDepartures')
  })

  afterEach(function () {
    rawDeparturesStub.restore()
  })

  describe('#getData', function () {
    it('should return non-cancelled TrainDepartures', async function () {
      const rawDepartures: Alternative[] = [
        {
          tripId: '1',
          destination: { type: 'station', name: 'Station #1' },
          direction: 'Direction #1',
          line: { type: 'line', name: 'Line #1' },
          when: '2023-12-20T00:44:00Z',
          plannedWhen: '2023-12-20T00:44:00Z'
        },
        {
          tripId: '2',
          destination: { type: 'station', name: 'Station #2' },
          direction: 'Direction #2',
          line: { type: 'line', name: 'Line #2' },
          when: '2023-12-20T00:55:00Z',
          plannedWhen: '2023-12-20T00:54:00Z'
        }
      ]

      rawDeparturesStub.onFirstCall().returns(Promise.resolve(rawDepartures))

      const value = await subject.getData()

      assert.deepStrictEqual(value, [
        {
          destination: 'Station #1',
          direction: 'Direction #1',
          line: 'Line #1',
          time: '2023-12-20T00:44:00Z',
          plannedTime: '2023-12-20T00:44:00Z'
        },
        {
          destination: 'Station #2',
          direction: 'Direction #2',
          line: 'Line #2',
          time: '2023-12-20T00:55:00Z',
          plannedTime: '2023-12-20T00:54:00Z'
        }
      ])
    })

    it('should exclude cancelled TrainDepartures', async function () {
      const rawDepartures: Alternative[] = [
        {
          tripId: '1',
          destination: { type: 'station', name: 'Station #1' },
          direction: 'Direction #1',
          line: { type: 'line', name: 'Line #1' },
          when: '2023-12-20T00:44:00Z',
          plannedWhen: '2023-12-20T00:44:00Z'
        },
        {
          tripId: '2',
          destination: { type: 'station', name: 'Station #1' },
          direction: 'Direction #1',
          line: { type: 'line', name: 'Line #1' },
          when: undefined,
          plannedWhen: '2023-12-20T00:44:00Z'
        },
        {
          tripId: '3',
          destination: { type: 'station', name: 'Station #2' },
          direction: 'Direction #2',
          line: { type: 'line', name: 'Line #2' },
          when: '2023-12-20T00:55:00Z',
          plannedWhen: '2023-12-20T00:54:00Z'
        }
      ]

      rawDeparturesStub.onFirstCall().returns(Promise.resolve(rawDepartures))

      const value = await subject.getData()

      assert.deepStrictEqual(value, [
        {
          destination: 'Station #2',
          direction: 'Direction #2',
          line: 'Line #2',
          time: '2023-12-20T00:55:00Z',
          plannedTime: '2023-12-20T00:54:00Z'
        }
      ])
    })
  })
})
