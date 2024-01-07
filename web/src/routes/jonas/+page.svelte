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
<div class="w-screen h-screen">
  <div class="flex h-40 p-4 gap-4">
    <Clock />
    <Weather {weatherData} />
  </div>
</div>