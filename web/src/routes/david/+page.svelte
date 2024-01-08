<script lang="ts">
    import Clock from '$lib/components/Clock.svelte'
    import Weather from '$lib/components/weather/Weather.svelte'
    import EventsComponent from '$lib/components/events/Events.svelte'
    import TrainDeparturesComponent from '$lib/components/trainDepartures/TrainDepartures.svelte'

    import { eventsStore, weatherDataStore, trainDeparturesStore } from '$lib/stores'
    import type { WeatherData, Events, TrainDepartures } from '../../../../shared-types'

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
</script>

<div class="w-screen h-screen p-4 overflow-hidden">
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
</div>