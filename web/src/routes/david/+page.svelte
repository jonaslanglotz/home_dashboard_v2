<script lang="ts">
    import Clock from '$lib/components/Clock.svelte'
    import Weather from '$lib/components/weather/Weather.svelte'
    import { weatherDataStore } from '$lib/stores'
    import type { WeatherData } from '../../../../shared-types'

    let weatherData: WeatherData | undefined
    weatherDataStore.subscribe(value => {
      weatherData = value
    })
</script>

<div class="h-screen w-screen overflow-hidden bg-white text-black flex flex-row">
	<div class="w-8/12 flex flex-col py-4 pl-4 h-full flex-shrink-0">
		<div class="flex gap-4">
<!-- <div class="w-screen h-screen p-4">
  <div class="flex flex-col w-2/3 py-4">
    <div class="flex flex-row"> -->
      <Clock />
      <Weather {weatherData} horizontal={true} />
    </div>
  </div>
</div>