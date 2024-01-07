<script lang="ts">
  import { ArrowDown, ArrowUp } from 'svelte-bootstrap-icons'
	import WeatherIcon from './WeatherIcon.svelte'
	import WeatherChart from './WeatherChart.svelte'
	import type { WeatherData } from '../../../../../shared-types'

	export let weatherData: WeatherData | undefined
	export let horizontal = false

	const formatTemperature = (temperature: number) => `${Math.round(temperature)}°C`

	let temperatureString = '?'
	let lowTemperatureString = '?'
	let highTemperatureString = '?'

	$: if (weatherData != null) {
		temperatureString = formatTemperature(weatherData.temperature)
		lowTemperatureString = formatTemperature(weatherData.lowTemperature)
		highTemperatureString = formatTemperature(weatherData.highTemperature)
	}
</script>

<div class="w-full h-full flex flex-col bg-blue-500 text-stone-100 rounded-xl">
	<div class="flex justify-between px-2 pt-2">
		<div class="flex gap-1.5">
			<span class="text-4xl">{temperatureString}</span>
			<div class="text-blue-100 mt-1 leading-4 text-sm">
				<span class="flex items-center"><ArrowUp class="w-2.5 h-2.5"/>{highTemperatureString}</span>
				<span class="flex items-center"><ArrowDown class="w-2.5 h-2.5"/>{lowTemperatureString}</span>
			</div>
		</div>
		<WeatherIcon weatherIconIdentifier={weatherData?.icon} class="w-9 h-9" />
	</div>
	{#if weatherData != null}
		<WeatherChart {weatherData} viewboxWidth={horizontal ? 220 : 200} viewboxHeight={horizontal ? 55 : 80} />
	{/if}
</div>
