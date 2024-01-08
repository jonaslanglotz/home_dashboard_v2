<script lang="ts">
	import type { TrainDepartures } from '../../../../../shared-types'
  import TrainDepartureComponent from './TrainDeparture.svelte'

  export let trainDepartures: TrainDepartures | undefined
  export let lines: string
  export let maxCount = 6

  $: relevantDepartures = (trainDepartures ?? []).filter(d => lines.includes(d.line)).slice(undefined, maxCount)

</script>

<div class="flex flex-col py-2 bg-slate-100 rounded-2xl overflow-hidden">
  <span class="text-center font-serif -mt-1 mb-1 text-xl text-slate-700">Abfahrten</span>

  <div class="flex flex-col flex-grow overflow-hidden">
    {#each relevantDepartures as trainDeparture}
      <TrainDepartureComponent {trainDeparture} />
    {/each}
  </div>

</div>
