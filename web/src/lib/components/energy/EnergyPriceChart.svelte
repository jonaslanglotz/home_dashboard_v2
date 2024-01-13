<script lang="ts">
  import { extent, scaleLinear, line, curveNatural, scaleTime } from 'd3'

  import type { EnergyPrices } from '../../../../../shared-types'
  import EnergyPriceChartLeftAxis from './EnergyPriceChartLeftAxis.svelte'
  import EnergyPriceChartBottomAxis from './EnergyPriceChartBottomAxis.svelte'

  export let energyPrices: EnergyPrices
  export let viewboxWidth = 200
  export let viewboxHeight = 175

  let dates: Date[]
  let prices: number[]

  $: dates = energyPrices.slice(0, 24).map(hour => new Date(hour.time))
  $: prices = energyPrices.slice(0, 24).map(hour => hour.price)

  // We can cast here, since extent will only return [undefined, undefined] when the input array
  // contains no comparable values, which we can guarantee it will not
  let dateExtent: [Date, Date]
  let priceExtent: [number, number]
  $: dateExtent = extent(dates) as [Date, Date]
  $: priceExtent = extent(prices) as [number, number]

  // Ensure that the extent has a non zero width (so that the bars are always visible)
  $: priceExtent[0] -= 0.01
  $: priceExtent[1] += 0.01

  $: xScalePrice = scaleTime()
    .domain(dateExtent)
    .range([35, viewboxWidth])

  $: yScalePrice = scaleLinear()
    .domain(priceExtent)
    .range([0.9 * viewboxHeight, -10])

  $: lineGenerator = line()
    .curve(curveNatural)
    .x((data) => xScalePrice(data[0]))
    .y((data) => yScalePrice(data[1]))

  // @ts-expect-error: Providing a date value, even though d3 typings specify a number is needed
  $: priceLine = lineGenerator(dates.map((date, i) => [date, prices[i]]))

  $: circleX = xScalePrice(dates[new Date().getHours()])
  $: circleY = yScalePrice(prices[(new Date()).getHours()])


</script>

<div>
  <svg viewBox="0 -5 {viewboxWidth} {viewboxHeight}">
    <g>
      <EnergyPriceChartBottomAxis scale={xScalePrice} labelHeight={viewboxHeight - 25} />
      <EnergyPriceChartLeftAxis scale={yScalePrice} labelOffset={235} />
      <path d={priceLine} class="stroke-blue-400 opacity-90 fill-none stroke-2" />
      <circle cx={circleX} cy={circleY} r=4 class="stroke-blue-400 opacity-90 fill-none stroke-2"/>
    </g>
  </svg>
</div>
