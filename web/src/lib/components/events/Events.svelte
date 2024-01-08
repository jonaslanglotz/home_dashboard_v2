<script lang="ts">
	import type { Events, Event } from '../../../../../shared-types'
	import EventComponent from './Event.svelte'

  export let events: Events | undefined

  const dateString = (date: Date) => date.toISOString().split('T')[0]
  
  const shiftDateByDays = (date: Date, days: number) => {
    const shiftedDate = new Date(date)
    shiftedDate.setDate(shiftedDate.getDate() + days)
    return shiftedDate
  }

  interface GroupMap<T> { [key: string]: T[] | undefined }

  function groupBy<T> (list: Array<T>, selector: (item: T) => string) {
    return list.reduce((groups, item) => {
      const key = selector(item)
      const group = groups[key] ?? []

      group.push(item)
      groups[key] = group

      return groups
    }, {} as GroupMap<T>)
  }

  let groupedEvents: GroupMap<Event> = {}
  $: groupedEvents = events == null ? {} : groupBy(events, (event => dateString(new Date(event.date))))

  const todayDateString = dateString(new Date())
  const tommorowDateString = dateString(shiftDateByDays(new Date(), 1))

  const dateText = (dateString: string) => {
    switch (dateString) {
      case todayDateString:
        return 'Heute'
      case tommorowDateString:
        return 'Morgen'
      default:
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
    }
  }

  const sortEventsByHasTime = (a: Event, b: Event) => {
    if (a == b) { return 0 }
    else if (a) { return 1 }
    else { return -1 }
  }

</script>

<div class="flex flex-col py-2 bg-slate-100 rounded-2xl overflow-hidden">
  <span class="text-center font-serif text-xl text-slate-700">Termine</span>
  <div class="hide-scrollbar overflow-auto">
    {#each Object.keys(groupedEvents).sort() as dateString}
      {@const eventsOnDay = (groupedEvents[dateString] ?? []).sort(sortEventsByHasTime)}
      {#if dateString >= todayDateString && (dateString == todayDateString || eventsOnDay.length !== 0)}
        <div class="flex flex-col px-4">
          <span class="text-blue-400 text-xs pb-0.5">{dateText(dateString)}</span>
          {#if eventsOnDay.length !== 0}
            {#each eventsOnDay as event}
              <EventComponent {event} />
            {/each}
          {:else}
            <span class="text-gray-800">Keine Termine</span>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .hide-scrollbar {
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>