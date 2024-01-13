<script lang="ts">
    import Clock from '$lib/components/Clock.svelte'
    import Weather from '$lib/components/weather/Weather.svelte'
    import EventsComponent from '$lib/components/events/Events.svelte'
    import TrainDeparturesComponent from '$lib/components/trainDepartures/TrainDepartures.svelte'

    import { eventsStore, weatherDataStore, trainDeparturesStore, energyPricesStore, energyUseDataStore } from '$lib/stores'
    import type { WeatherData, Events, TrainDepartures, EnergyPrices, EnergyUseData } from '../../../../shared-types'
    import Energy from '$lib/components/energy/Energy.svelte'

    let weatherData: WeatherData | undefined
    weatherDataStore.subscribe(value => {
      weatherData = value
    })

    let events: Events | undefined
    eventsStore.subscribe(value => {
      events = value
    })

    let trainDepartures: TrainDepartures | undefined
    trainDeparturesStore.subscribe(value => {
      trainDepartures = value
    })

    let energyPrices: EnergyPrices | undefined
    energyPricesStore.subscribe(value => {
      energyPrices = value
    })

    let energyUseData: EnergyUseData | undefined
    energyUseDataStore.subscribe(value => {
      energyUseData = value
    })
</script>

<div class="w-screen h-screen flex gap-4 p-4 overflow-hidden">
  <div class="flex flex-col w-2/3 h-full gap-4">
    <div class="grid grid-cols-2 gap-4">
      <Clock />
      <Weather {weatherData} horizontal={true} />
    </div>
    <div class="grid grid-cols-2 gap-4 min-h-0">
      <EventsComponent {events}/>
      <TrainDeparturesComponent {trainDepartures} lines={['S5', 'RB26']}/>
    </div>
  </div>
  <div class="flex w-1/3 h-full">
      <Energy {energyPrices} {energyUseData} />
  </div>
</div>