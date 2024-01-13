<script lang="ts">
  import type { WeatherIconIdentifier } from '../../../../../shared-types'
  import {
    CloudMoon,
    CloudRain,
    Clouds,
    CloudSnow,
    CloudSun,
    MoonStars,
    Sun,
    CloudFog2,
    ExclamationTriangle,
    CloudSleet,
    Wind,
  } from 'svelte-bootstrap-icons'

  const weatherIconIdentifierToIcon = (
    identifier: WeatherIconIdentifier | undefined,
  ) => {
    switch (identifier) {
      case 'clear-day':
        return Sun

      case 'clear-night':
        return MoonStars

      case 'cloudy':
        return Clouds

      case 'fog':
        return CloudFog2

      case 'partly-cloudy-day':
        return CloudSun

      case 'partly-cloudy-night.':
        return CloudMoon

      case 'rain':
        return CloudRain

      case 'sleet':
        return CloudSleet

      case 'snow':
        return CloudSnow

      case 'wind':
        return Wind

      default:
        return ExclamationTriangle
    }
  }

  export let weatherIconIdentifier: WeatherIconIdentifier | undefined
</script>

<svelte:component
  this={weatherIconIdentifierToIcon(weatherIconIdentifier)}
  {...$$props}
/>
