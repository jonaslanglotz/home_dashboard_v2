<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { SpotifyOverlayState } from '../../../../../shared-types'

  export let overlay: SpotifyOverlayState | undefined

  $: track = overlay?.track
  let animationFrameId: number | undefined
  let timelineNow = 0
  let displayedProgressMs = 0
  let baseProgressMs = 0
  let baseTimestampMs = 0
  let currentTrackId: string | undefined
  let lastServerUpdate = 0

  const tick = (): void => {
    timelineNow = Date.now()
    animationFrameId = requestAnimationFrame(tick)
  }

  function startAnimationLoop (): void {
    if (animationFrameId != null) { return }
    timelineNow = Date.now()
    animationFrameId = requestAnimationFrame(tick)
  }

  function stopAnimationLoop (): void {
    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = undefined
    }
  }

  function resetState (): void {
    displayedProgressMs = 0
    baseProgressMs = 0
    baseTimestampMs = 0
    currentTrackId = undefined
    lastServerUpdate = 0
  }

  $: {
    if (overlay?.isVisible === true && track != null) {
      const updateToken = overlay?.lastUpdated ?? 0
      const trackChanged = track.id !== currentTrackId
      if (trackChanged || updateToken !== lastServerUpdate) {
        currentTrackId = track.id
        lastServerUpdate = updateToken
        const serverTimestamp = overlay?.lastUpdated ?? Date.now()
        const now = Date.now()
        const serverProgress = track.progressMs ?? 0
        const duration = track.durationMs ?? 0
        const adjustedProgress = Math.min(serverProgress + Math.max(0, now - serverTimestamp), duration)
        baseProgressMs = adjustedProgress
        baseTimestampMs = now
      }
      startAnimationLoop()
    } else {
      stopAnimationLoop()
      resetState()
    }
  }

  onDestroy(() => {
    stopAnimationLoop()
  })

  $: {
    if (overlay?.isVisible === true && track != null) {
      const duration = track.durationMs ?? 0
      const elapsed = Math.max(0, timelineNow - baseTimestampMs)
      displayedProgressMs = Math.min(baseProgressMs + elapsed, duration)
    } else {
      displayedProgressMs = 0
    }
  }

  $: progressPercent = track != null && track.durationMs > 0 ? Math.min((displayedProgressMs / track.durationMs) * 100, 100) : 0
  // Set CSS inline background for the blurred album backdrop
  $: backgroundImageStyle = track?.albumArtUrl != null ? `url('${track.albumArtUrl}')` : undefined

  function formatTime (ms: number | undefined): string {
    if (ms == null) { return '0:00' }
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
</script>

<div class="w-screen h-screen">
  {#if overlay?.isVisible && track}
    <div class="relative w-full h-full overflow-hidden bg-slate-900 text-white">
      {#if track.albumArtUrl}
        <!-- Blurred album-based background layer -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -inset-64 blur-[200px] scale-[1.35] rotate-[127deg] opacity-80 bg-cover bg-center" style={`background-image: ${backgroundImageStyle}`}></div>
          <div class="absolute inset-0 bg-black/00"></div>
        </div>
      {/if}

      <div class="relative z-10 flex flex-col items-start justify-center text-left w-full h-full p-4 lg:p-10 gap-6">
        <div class="w-full max-w-md aspect-square flex items-center justify-center bg-white/5 rounded shadow-2xl overflow-hidden">
          {#if track.albumArtUrl}
            <img class="w-full h-full object-cover" src={track.albumArtUrl} alt={`Album artwork for ${track.album}`} />
          {:else}
            <div class="text-center px-4">Album art unavailable</div>
          {/if}
        </div>

        <div class="w-full max-w-xl space-y-4 text-left">
          <div>
            <p class="text-4xl font-semibold">{track.title}</p>
          </div>

          <div class="space-y-1">
            <p class="text-lg text-white/90">{track.artists.join(', ')}</p>
            <p class="text-white/70">{track.album}</p>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs uppercase tracking-wider text-white/70">
              <span>{formatTime(displayedProgressMs)}</span>
              <span>{formatTime(track.durationMs)}</span>
            </div>
            <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-white transition-all" style={`width: ${progressPercent}%`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex w-full h-full items-center justify-center bg-slate-900 text-white">
      <p>Spotify overlay inactive.</p>
    </div>
  {/if}
</div>
