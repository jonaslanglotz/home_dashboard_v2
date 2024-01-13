<script lang="ts">
  import { select } from 'd3-selection'
  import { axisBottom } from 'd3-axis'
  import { timeFormat, type ScaleTime } from 'd3'

  export let labelHeight = 72
  export let scale: ScaleTime<number, number, never>

  // Only generate every 2th label, starting with the third
  const shouldGenerateLabel = (index: number) => (index - 1) % 2 === 0

	const hourLabelFormat = timeFormat('%_H:%M')

  let g: SVGElement

  $: axis = axisBottom(scale)
      .tickSize(0)
      .tickFormat((label, index) => shouldGenerateLabel(index) ? hourLabelFormat(label as Date) : '')

  $: select(g)
    // @ts-expect-error: According to the d3 documentation, this is correct.
    .call(axis)
    .select('.domain')
      .attr('stroke-width', 0)
</script>

<g class="axis font-sans" bind:this={g} transform={`translate(0, ${labelHeight})`} />
