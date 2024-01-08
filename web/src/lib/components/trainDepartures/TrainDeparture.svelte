<script lang="ts">
  import type { TrainDeparture } from '../../../../../shared-types'

  export let trainDeparture: TrainDeparture

  interface LineColorMap { [key: string]: string }
  export const LINE_COLORS: LineColorMap = {
    'S5': 'green-500',
    'RB26': 'teal-400'
  }

  const minutesBetweenDates = (a: Date, b: Date) => (b.valueOf() - a.valueOf()) / (60 * 1000)
  const formatDelay = (delayInMinutes: number | undefined) => delayInMinutes === undefined ? '' : delayInMinutes.toLocaleString('de-DE', { signDisplay: 'always' })

  $: time = new Date(trainDeparture.time)
  $: plannedTime = new Date(trainDeparture.plannedTime)

  $: timeString = plannedTime.toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit' })
  $: delayInMinutes = trainDeparture.time == '' ? undefined : minutesBetweenDates(plannedTime, time)
  $: cancelled = trainDeparture.time == ''
</script>

<div class="rounded-md px-2 mx-4 py-2 mb-2 flex bg-white shadow-lg items-start flex-grow">

  <!-- time and delay -->
  <div class="flex flex-col mt-1">
    <span class="text-xs leading-none ml-1 text-gray-700 {cancelled && 'text-red-500 line-through font-bold'}">{timeString}</span>
    <span class="text-xs leading-none ml-1 font-bold {delayInMinutes !== 0 && 'text-red-500'} {delayInMinutes === 0 && 'text-gray-400'}">{formatDelay(delayInMinutes)}</span>
  </div>

  <!-- line and direction -->
  <div class="flex flex-row h-full items-start">

    <div class="flex { `bg-${LINE_COLORS[trainDeparture.line] ?? 'gray-400'}` } rounded-full py-0.5 px-1 ml-2 mt-0.5 items-start">
      <span class="text-xs leading-none">{trainDeparture.line}</span>
    </div>

    {#if trainDeparture.direction.includes(',')}
      {@const directionParts = trainDeparture.direction.split(', ')}
      <div class="ml-1 mt-1 flex flex-col">
        <span class="text-xs leading-none">{directionParts[0]}</span>
        <span class="text-[0.4rem]">{directionParts[1]}</span>
      </div>
    {:else}
      <span class="text-xs leading-none ml-1 mt-1">{trainDeparture.direction}</span>
    {/if}

  </div>
</div>
