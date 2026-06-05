<script lang="ts">
    import Clock from '$lib/components/Clock.svelte'
    import Weather from '$lib/components/weather/Weather.svelte'
    import EventsComponent from '$lib/components/events/Events.svelte'
    import TrainDeparturesComponent from '$lib/components/trainDepartures/TrainDepartures.svelte'
    import TasksComponent from '$lib/components/tasks/Tasks.svelte'
    import NowPlayingOverlay from '$lib/components/nowPlaying/NowPlayingOverlay.svelte'

    import { weatherDataStore, eventsStore, trainDeparturesStore, tasksStore, spotifyOverlayStore } from '$lib/stores'
    import type { WeatherData, Events, TrainDepartures, Tasks, SpotifyOverlayState } from '../../../../shared-types'

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
    
    let tasks: Tasks | undefined
    tasksStore.subscribe(value => {
      tasks = value
    })

    let spotifyOverlay: SpotifyOverlayState | undefined
    spotifyOverlayStore.subscribe(value => {
      spotifyOverlay = value
    })
</script>

{#if spotifyOverlay?.isVisible && spotifyOverlay.track}
  <NowPlayingOverlay overlay={spotifyOverlay} />
{:else}
  <div class="w-screen h-screen flex flex-col overflow-hidden p-4 gap-4">
    <div class="flex h-40 gap-4">
      <Clock />
      <Weather {weatherData} />
    </div>
    <div class="grid grid-cols-2 auto-rows-fr gap-4 min-h-0">
      <TasksComponent {tasks} />
      <EventsComponent {events} />
      <TrainDeparturesComponent {trainDepartures} lines={['S5']} />
      <placeholder />
    </div>
  </div>
{/if}
