<script lang="ts">
  import { select } from 'd3-selection'
  import { axisBottom } from 'd3-axis'
  import type { ScaleBand } from 'd3'

  export let labelHeight = 72
  export let scale: ScaleBand<string>

  // Only generate every 6th label, starting with the third
  const shouldGenerateLabel = (index: number) => (index - 3) % 6 === 0

  let g: SVGElement

  $: axis = axisBottom(scale)
      .tickSize(0)
      .tickFormat((label, index) => shouldGenerateLabel(index) ? label.toString() : '')

  $: select(g).selectAll('*').remove()

  $: select(g)
    // @ts-expect-error: According to the d3 documentation, this is correct.
    .call(axis)
    .select('.domain')
      .attr('stroke-width', 0)
</script>

<g class="axis font-sans" bind:this={g} transform={`translate(0, ${labelHeight})`} />