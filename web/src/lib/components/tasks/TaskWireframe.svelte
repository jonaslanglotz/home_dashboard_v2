<script lang="ts">
  export let title: string = ''
</script>

<div class="flex p-2 mb-2 bg-white shadow-lg rounded-md">
  <div class="rounded-full w-2.5 h-2.5 border-[0.05rem] border-red bg-blue mr-1 mt-[0.06rem] flex-shrink-0" />
  <div class="flex flex-col">
    <span class="text-xs font-wireframe leading-none text-gray-200">{title}</span>
  </div>
</div>
