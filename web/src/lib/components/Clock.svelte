<script lang="ts">
 import { onDestroy } from 'svelte'

	let time: string
	let date: string

  const getTime = () => (new Date()).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' })

  const getDate = () => (new Date()).toLocaleString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

	time = getTime()
	date = getDate()

  const interval = setInterval(() => { time = getTime(); date = getDate() }, 1000)

  onDestroy(() => clearInterval(interval))
</script>

<div class="w-72 flex flex-col justify-between flex-shrink-0">
	<h1 class="text-[7rem] font-serif font-bold leading-[80%] my-2 text-center">{time}</h1>
	<div class="flex mt-2">
		<div class="flex-grow bg-blue-400 mr-1.5 mb-0 mt-0.5" />
		<h1 class="text-base font-sans leading-none">{date}</h1>
	</div>
</div>
