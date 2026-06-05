import { EventEmitter } from 'node:events'
import { IntervalBasedDataProvider } from '../interval-based-data-provider'
import { logger } from '../../utils/log'
import { HomeAssistantPresenceClient, type PresenceState } from './home-assistant-presence'
import { SpotifyNowPlayingClient, type SpotifyPollingResult } from './spotify-now-playing'
import { type SpotifyOverlayState } from '../../../../shared-types'

const ACTIVE_POLL_INTERVAL_MS = 1000
const IDLE_POLL_INTERVAL_MS = 15000

interface Options {
  presenceClient: HomeAssistantPresenceClient
  spotifyClient: SpotifyNowPlayingClient
  minResumeIntervalMs: number
  activePollIntervalMs?: number
  idlePollIntervalMs?: number
}

export interface EnvConfigurationValues {
  SPOTIFY_OVERLAY_HOME_ASSISTANT_WS_URL: string
  SPOTIFY_OVERLAY_HOME_ASSISTANT_TOKEN: string
  SPOTIFY_OVERLAY_HOME_ASSISTANT_PRESENCE_ENTITY: string
  SPOTIFY_OVERLAY_SPOTIFY_CLIENT_ID: string
  SPOTIFY_OVERLAY_SPOTIFY_CLIENT_SECRET: string
  SPOTIFY_OVERLAY_SPOTIFY_REFRESH_TOKEN: string
  SPOTIFY_OVERLAY_MIN_RESUME_INTERVAL: number
}

export class SpotifyOverlayProvider extends EventEmitter {
  static readonly DATA_EVENT = IntervalBasedDataProvider.DATA_EVENT

  private readonly presenceClient: HomeAssistantPresenceClient
  private readonly spotifyClient: SpotifyNowPlayingClient
  private readonly minResumeIntervalMs: number
  private readonly activePollIntervalMs: number
  private readonly idlePollIntervalMs: number
  private readonly log = logger.child({ module: this.constructor.name })

  private hasStarted = false
  private isHome = false
  private pollTimeout: NodeJS.Timeout | undefined
  private graceTimeout: NodeJS.Timeout | undefined
  private currentState: SpotifyOverlayState | undefined

  constructor (options: Options) {
    super()
    this.presenceClient = options.presenceClient
    this.spotifyClient = options.spotifyClient
    this.minResumeIntervalMs = options.minResumeIntervalMs
    this.activePollIntervalMs = options.activePollIntervalMs ?? ACTIVE_POLL_INTERVAL_MS
    this.idlePollIntervalMs = options.idlePollIntervalMs ?? IDLE_POLL_INTERVAL_MS
  }

  start (): void {
    if (this.hasStarted) { return }
    this.hasStarted = true
    this.presenceClient.on(HomeAssistantPresenceClient.PRESENCE_EVENT, (state: PresenceState) => {
      this._handlePresence(state)
    })
    this.presenceClient.start()
  }

  stop (): void {
    this.hasStarted = false
    this.presenceClient.removeAllListeners(HomeAssistantPresenceClient.PRESENCE_EVENT)
    this.presenceClient.stop()
    this._stopPolling()
    this._clearGraceTimeout()
  }

  private _handlePresence (state: PresenceState): void {
    const isNowHome = state === 'home'
    const wasHome = this.isHome
    this.isHome = isNowHome

    if (isNowHome) {
      this.log.debug('Presence detected at home, enabling Spotify polling')
      if (!wasHome) {
        this._schedulePoll(0)
      }
    } else {
      this.log.debug('Presence left home, hiding overlay')
      this._stopPolling()
      this._clearGraceTimeout()
      this._emitHiddenState()
    }
  }

  private _schedulePoll (delayMs: number): void {
    if (!this.isHome) { return }
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout)
    }
    this.pollTimeout = setTimeout(() => {
      void this._pollNowPlaying()
    }, delayMs)
  }

  private _stopPolling (): void {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout)
      this.pollTimeout = undefined
    }
  }

  private async _pollNowPlaying (): Promise<void> {
    this.pollTimeout = undefined
    if (!this.isHome) { return }

    try {
      const result = await this.spotifyClient.getCurrentlyPlaying()
      this._processSpotifyResult(result)
      const nextDelay = result.retryAfterMs ?? (result.track?.isPlaying === true ? this.activePollIntervalMs : this.idlePollIntervalMs)
      this._schedulePoll(nextDelay)
    } catch (error) {
      this.log.error({ error }, 'Failed to poll Spotify now playing endpoint')
      this._schedulePoll(this.idlePollIntervalMs)
    }
  }

  private _processSpotifyResult (result: SpotifyPollingResult): void {
    if (!this.isHome) { return }

    if (result.track != null && result.track.isPlaying) {
      this._clearGraceTimeout()
      this._emitVisibleState(result.track)
      return
    }

    if (this.currentState?.isVisible === true) {
      this._startGraceTimeout()
    } else {
      this._emitHiddenState()
    }
  }

  private _emitVisibleState (track: SpotifyOverlayState['track']): void {
    if (track == null) { return }
    const state: SpotifyOverlayState = {
      isVisible: true,
      track,
      lastUpdated: Date.now()
    }
    this.currentState = state
    this.emit(SpotifyOverlayProvider.DATA_EVENT, state)
  }

  private _emitHiddenState (): void {
    if (this.currentState?.isVisible !== true) {
      this.currentState = { isVisible: false, lastUpdated: Date.now() }
      this.emit(SpotifyOverlayProvider.DATA_EVENT, this.currentState)
      return
    }

    const state: SpotifyOverlayState = {
      isVisible: false,
      lastUpdated: Date.now()
    }
    this.currentState = state
    this.emit(SpotifyOverlayProvider.DATA_EVENT, state)
  }

  private _startGraceTimeout (): void {
    if (this.graceTimeout != null) { return }
    this.graceTimeout = setTimeout(() => {
      this.graceTimeout = undefined
      this._emitHiddenState()
    }, this.minResumeIntervalMs)
  }

  private _clearGraceTimeout (): void {
    if (this.graceTimeout != null) {
      clearTimeout(this.graceTimeout)
      this.graceTimeout = undefined
    }
  }
}

export const fromEnv = (env: EnvConfigurationValues): SpotifyOverlayProvider => {
  const presenceClient = new HomeAssistantPresenceClient({
    url: env.SPOTIFY_OVERLAY_HOME_ASSISTANT_WS_URL,
    token: env.SPOTIFY_OVERLAY_HOME_ASSISTANT_TOKEN,
    entityId: env.SPOTIFY_OVERLAY_HOME_ASSISTANT_PRESENCE_ENTITY
  })

  const spotifyClient = new SpotifyNowPlayingClient({
    clientId: env.SPOTIFY_OVERLAY_SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_OVERLAY_SPOTIFY_CLIENT_SECRET,
    refreshToken: env.SPOTIFY_OVERLAY_SPOTIFY_REFRESH_TOKEN
  })

  return new SpotifyOverlayProvider({
    presenceClient,
    spotifyClient,
    minResumeIntervalMs: env.SPOTIFY_OVERLAY_MIN_RESUME_INTERVAL
  })
}
