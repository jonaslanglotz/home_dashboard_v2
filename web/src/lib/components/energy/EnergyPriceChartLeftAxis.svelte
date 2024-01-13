<script lang="ts">
  import { select } from 'd3-selection'
  import { axisLeft, type ScaleLinear } from 'd3'

  export let labelOffset = 235
  export let scale: ScaleLinear<number, number, never>

  let g: SVGElement

  $: axis = axisLeft(scale)
      .tickSize(200)
      .tickFormat((label) => `${label.toLocaleString('de-DE', { 
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'symbol'
      })}`)

  $: select(g)
    // @ts-expect-error: According to the d3 documentation, this is correct.
    .call(axis)
    .select('.domain')
      .attr('stroke-width', 0)
</script>

<g class="axis font-sans" bind:this={g} transform={`translate(${labelOffset}, 0)`} />

<style>
	.axis {
		stroke-width: 0.1px;
	}
</style>
