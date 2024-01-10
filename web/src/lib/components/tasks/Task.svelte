<script lang="ts">
	import type { Task } from '../../../../../shared-types'
	import { Calendar2, Clock } from 'svelte-bootstrap-icons'
  import {marked} from 'marked'
    import { dateString } from '$lib/dateString'

  export let task: Task

  const todayDateString = dateString(new Date())
  const isTaskToday: (task: Task) => boolean = task => {
    return dateString(new Date(task.due)) == todayDateString
  }
  
  let dueDate: Date
  $: dueDate = new Date(task.due)

  type DueStatus = 'futureDate' | 'futureTime' | 'pastDate' | 'pastTime'
  const getDueStatusFromTask: (task: Task) => DueStatus = task => {
    const due = task.due
    if (due.length === 10) {
      // date
      return isTaskToday(task) ? 'futureDate' : 'pastDate'
    } else {
      // time
      return dueDate > new Date() ? 'futureTime' : 'pastTime'
    }
  }

  const isTaskInPast: (task: Task) => boolean = task => getDueStatusFromTask(task).startsWith('past')

  let dueStatus: DueStatus
  $: dueStatus = getDueStatusFromTask(task)

  let dueString: string
  $: switch (dueStatus) {
    case 'futureDate':
      dueString = ''
      break
    case 'futureTime':
      dueString = dueDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
      break
    case 'pastDate':
      dueString = dueDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
      break
    case 'pastTime':
      dueString = isTaskToday(task)
      ? dueDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
      : dueDate.toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'  }) + ' Uhr'
      break
  }

  let taskBgColor: string
  let taskBorderColor: string
  $: switch (task.priority) {
    case 2:
      taskBorderColor = 'border-blue-500'
      taskBgColor = 'bg-blue-50'
      break
    case 3:
      taskBorderColor = 'border-amber-500'
      taskBgColor = 'bg-amber-50'
      break
    case 4:
      taskBorderColor = 'border-red-500'
      taskBgColor = 'bg-red-50'
      break
    case 1:
    default:
      taskBorderColor = 'border-gray-700'
      taskBgColor = 'bg-white'
      break
  }
</script>

<div class="flex p-2 mb-2 bg-white shadow-lg rounded-md">
  <div class="rounded-full w-2.5 h-2.5 border-[0.05rem] {taskBorderColor} {taskBgColor} mr-1 mt-[0.06rem] flex-shrink-0" />
  <div class="flex flex-col">
    <span class="text-xs leading-none">{@html marked.parse(task.title)}</span>
    <span class="flex items-center text-[0.5rem] {isTaskInPast(task) ? 'text-red-400' : 'text-slate-700'}">
      {#if isTaskInPast(task) && !isTaskToday(task) }
        <Calendar2 class="w-2.5 h-2.5 mr-1"/>
      {:else if dueStatus.endsWith('Time')} 
        <Clock class="w-2.5 h-2.5 mr-1"/>
      {/if}
      {dueString}
    </span>
  </div>
</div>