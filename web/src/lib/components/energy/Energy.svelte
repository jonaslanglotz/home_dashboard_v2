<script lang="ts">
	import EnergyPriceChart from './EnergyPriceChart.svelte'

	import type { EnergyPrices, EnergyUseData } from '../../../../../shared-types'
  import EnergyUseComponent from './EnergyUse.svelte'

	export let energyPrices: EnergyPrices | undefined
	export let energyUseData: EnergyUseData | undefined
</script>

<div class="w-full h-full flex flex-col px-4 py-2 bg-slate-100 rounded-2xl relative">
  {#if energyPrices !== undefined}
    <span class="text-center font-serif -mt-1 mb-1 text-xl text-slate-700">Stromkosten</span>
    <EnergyPriceChart {energyPrices} />
  {/if}
  <div class="h-10" />
  {#if energyUseData !== undefined}
    <span class="text-center font-serif -mt-1 mb-1 text-xl text-slate-700">Stromverbrauch</span>
    <EnergyUseComponent {energyUseData} />
  {/if}
</div>

