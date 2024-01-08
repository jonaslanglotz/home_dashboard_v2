<script lang="ts">
    import Clock from '$lib/components/Clock.svelte'
    import Weather from '$lib/components/weather/Weather.svelte'
    import EventsComponent from '$lib/components/events/Events.svelte'
    import TrainDeparturesComponent from '$lib/components/trainDepartures/TrainDepartures.svelte'

    import { weatherDataStore, eventsStore, trainDeparturesStore } from '$lib/stores'
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

<div class="w-screen h-screen flex flex-col overflow-hidden p-4 gap-4">
  <div class="flex h-40 gap-4">
    <Clock />
    <Weather {weatherData} />
  </div>
  <div class="grid grid-cols-2 auto-rows-fr gap-4 min-h-0">
    <placeholder />
    <EventsComponent {events} />
    <TrainDeparturesComponent {trainDepartures} lines={['S5']} />
    <placeholder />
  </div>
</div>