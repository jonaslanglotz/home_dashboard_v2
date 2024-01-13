<script lang="ts">
  import { extent, scaleLinear, line, curveNatural, scaleBand, scaleTime, timeFormat } from 'd3'
  import { select } from 'd3-selection'
  import WeatherChartAxis from './WeatherChartAxis.svelte'
  import type { WeatherData } from '../../../../../shared-types'

  export let weatherData: WeatherData
  export let viewboxWidth = 200
  export let viewboxHeight = 80

  let dates: Date[]
  let temperatures: number[]
  let precipitations: number[]

  $: dates = weatherData.hourly.map(hour => new Date(hour.timestamp * 1000))
  $: temperatures = weatherData.hourly.map(hour => hour.temperature)
  $: precipitations = weatherData.hourly.map(hour => hour.precipitation)

  const hourLabelFormat = timeFormat('%_H:%M')

  function extentWithMinimumWidth(iterable: Iterable<number>, minWidth: number): [number, number] {
    const realExtent = extent(iterable) 

    if (realExtent[0] === undefined) { return [0, minWidth]}

    const extentWidth = realExtent[1] - realExtent[0]
    const extentExtension = Math.max(0, minWidth - extentWidth) / 2

    return [realExtent[0] - extentExtension, realExtent[1] + extentExtension]
  }

  // We can cast here, since extent will only return [undefined, undefined] when the input array
  // contains no comparable values, which we can guarantee it will not
  let dateExtent: [Date, Date]
  let temperatureExtent: [number, number]
  let precipitationExtent: [number, number]

  $: dateExtent = extent(dates) as [Date, Date]
  $: temperatureExtent = extentWithMinimumWidth(temperatures, 5)
  $: precipitationExtent = extent(precipitations) as [number, number]
  $: precipitationExtent[1] += 1
  $: console.log(temperatureExtent)

  $: xScaleTemp = scaleTime()
    .domain(dateExtent)
    .range([0, viewboxWidth])

  $: xScaleRain = scaleBand()
    .domain(dates.map(hourLabelFormat))
    .range([0, viewboxWidth])
    .padding(0.2)

  $: yScaleTemp = scaleLinear()
    .domain(temperatureExtent)
    .range([0.8 * viewboxHeight, 0.25 * viewboxHeight])

  $: yScaleRain = scaleLinear()
    .domain(precipitationExtent)
    .range([0.875 * viewboxHeight, 0.3 * viewboxHeight])

  $: temperatureLineGenerator = line()
    .curve(curveNatural)
    .x((data) => xScaleTemp(data[0]))
    .y((data) => yScaleTemp(data[1]))

  // @ts-expect-error: Providing a date value, even though d3 typings specify a number is needed
  $: temperatureLine = temperatureLineGenerator(dates.map((date, i) => [date, temperatures[i]]))

  let g: SVGElement

  $: select(g).selectAll('.bar')
    // Cast here to ensure that the tuple type is correctly interpreted
    .data(dates.map((date, i) => [ date, precipitations[i]] as [Date, number]))
    .enter()
    .append('rect')
      .attr('x', data => xScaleRain(hourLabelFormat(data[0])) ?? 0)
      .attr('y', data => yScaleRain(data[1]))
      .attr('width', xScaleRain.bandwidth())
      .attr('height', data => 0.9 * viewboxHeight - yScaleRain(data[1]))

</script>

<div>
  <svg viewBox={`0 5 ${viewboxWidth} ${viewboxHeight}`}>
    <g>
      <WeatherChartAxis scale={xScaleRain} labelHeight={0.9 * viewboxHeight} />
      <g bind:this={g} class="fill-gray-200 opacity-50 stroke-none" />
      <path d={temperatureLine} class="stroke-gray-200 opacity-90 fill-none stroke-2" />
    </g>
  </svg>
</div>