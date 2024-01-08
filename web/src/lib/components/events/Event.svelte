<script lang="ts">
	import type { Event } from '../../../../../shared-types'

  export let event: Event
</script>

<div class=" flex  p-2 mb-2 rounded-md bg-white shadow-lg items-start">
  {#if event.hasTime}
    <span class="text-xs leading-none text-blue-500">{new Date(event.date).toLocaleTimeString('de-DE', { hour: 'numeric', minute: '2-digit'})}</span>
  {:else}
    <div class="bg-blue-500 w-0.5 h-3" />
  {/if}
  <span class="text-xs leading-none ml-1">{event.name}</span>
</div>