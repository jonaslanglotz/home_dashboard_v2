<script lang="ts">
	import type { Tasks } from '../../../../../shared-types'
	import TaskComponent from './Task.svelte'
	import TaskWireframe from './TaskWireframe.svelte'
	import { CheckAll } from 'svelte-bootstrap-icons'
  import { dateString } from '$lib/dateString'
  
  export let tasks: Tasks | undefined

  let relevantTasks: Tasks
  $: relevantTasks = tasks == null ? [] : tasks.filter(task => {
    const dueDateString = dateString(new Date(task.due))
    const todayDateString = dateString(new Date())

    return dueDateString <= todayDateString
  })

  let sortedTasks: Tasks
  $: sortedTasks = relevantTasks.sort((a, b) => {
    const dueA = a.due
    const dueB = b.due

    const dateA = dateString(new Date(dueA))
    const dateB = dateString(new Date(dueB))
    
    // Compare by date
    if (dateA !== dateB) { return dateB.localeCompare(dateA) }

    // Tasks with a time should come first
    if (dueA.length !== dueB.length) { return dueB.length - dueA.length }

    // Higher priority should come first
    if (a.priority !== b.priority) { return b.priority - a.priority }

    return dueA.localeCompare(dueB)
  })
</script>

<div class="w-full flex flex-col px-4 py-2 bg-slate-100 rounded-2xl relative">
  <span class="text-center font-serif -mt-1 mb-1 text-xl text-slate-700">Aufgaben</span>
  <div class="hide-scrollbar overflow-auto">
    {#if sortedTasks.length != 0}
      {#each sortedTasks as task}
        <TaskComponent {task} />
      {/each}
    {:else}
      <div class="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
        <div class="px-4 py-2 bg-white border-gray-200 border-8 rounded-md absolute z-10 flex-row flex items-center">
          <CheckAll class="w-6 h-6 mr-1 text-gray-800"/>
          <span class="text-gray-800">Alles erledigt</span>
        </div>
      </div>
      <div class="opacity-50">
        <TaskWireframe title="aaaaaa" />
        <TaskWireframe title="aaaa aaaaaaaaaaaa" />
        <TaskWireframe title="aaaaa aaaaaaa" />
        <TaskWireframe title="aaaaaaaaa aaaaaaaa aaa aaaa aaaaaaaaaaaaaa" />
        <TaskWireframe title="aaaaaaaaaa aaaaaaaa" />
        <TaskWireframe title="aaaaaa" />
        <TaskWireframe title="aaaa aaaaaaaaaaaa" />
        <TaskWireframe title="aaaaa aaaaaaa" />
        <TaskWireframe title="aaaaaaaaaa aaaaaaaa" />
      </div>
    {/if}
  </div>
</div>

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    scrollbar-width: none;
  }
</style>

