import { WithLogger } from '../../utils/class-with-logger'
import { DashboardError } from '../../utils/dashboard-error'
import { type SpotifyTrack } from '../../../../shared-types'

interface Options {
  clientId: string
  clientSecret: string
  refreshToken: string
}

interface SpotifyAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean
  progress_ms: number
  item?: {
    id?: string
    name?: string
    duration_ms?: number
    album?: {
      name?: string
      images?: Array<{ url?: string }>
    }
    artists?: Array<{ name?: string }>
    external_urls?: {
      spotify?: string
    }
  }
}

export interface SpotifyPollingResult {
  track?: SpotifyTrack
  isPlaying: boolean
  retryAfterMs?: number
}

export class SpotifyNowPlayingClient extends WithLogger {
  private readonly tokenUrl = 'https://accounts.spotify.com/api/token'
  private readonly nowPlayingUrl = 'https://api.spotify.com/v1/me/player/currently-playing'
  private readonly options: Options
  private accessToken: string | undefined
  private accessTokenExpiresAt = 0

  constructor (options: Options) {
    super()
    this.options = options
  }

  async getCurrentlyPlaying (): Promise<SpotifyPollingResult> {
    return await this._getCurrentlyPlaying(false)
  }

  private async _getCurrentlyPlaying (hasRetried: boolean): Promise<SpotifyPollingResult> {
    const token = await this._getAccessToken()
    const res = await fetch(this.nowPlayingUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.status === 204) {
      return { isPlaying: false }
    }

    if (res.status === 429) {
      const retryAfterHeader = res.headers.get('retry-after')
      const retryAfterSeconds = retryAfterHeader != null ? parseInt(retryAfterHeader, 10) : 1
      const retryAfterMs = Number.isNaN(retryAfterSeconds) ? 1000 : retryAfterSeconds * 1000
      this._log.warn({ retryAfterMs }, 'Spotify rate limited now-playing endpoint')
      return { isPlaying: false, retryAfterMs }
    }

    if (res.status === 401 && !hasRetried) {
      this._log.warn('Spotify token expired, refreshing and retrying.')
      this._invalidateAccessToken()
      return await this._getCurrentlyPlaying(true)
    }

    if (!res.ok) {
      const body = await res.text()
      throw new DashboardError('Received non-ok response from Spotify now playing endpoint', {
        status: res.status,
        body
      })
    }

    const data = await res.json() as SpotifyCurrentlyPlayingResponse
    const track = this._convertTrack(data)

    return {
      track,
      isPlaying: data.is_playing ?? false
    }
  }

  private _convertTrack (data: SpotifyCurrentlyPlayingResponse): SpotifyTrack | undefined {
    const item = data.item
    if (item == null || item.id == null) { return undefined }

    return {
      id: item.id,
      title: item.name ?? 'Unknown Track',
      album: item.album?.name ?? 'Unknown Album',
      albumArtUrl: item.album?.images?.[0]?.url,
      artists: (item.artists ?? []).map(artist => artist.name ?? 'Unknown Artist'),
      durationMs: item.duration_ms ?? 0,
      progressMs: data.progress_ms ?? 0,
      isPlaying: data.is_playing ?? false,
      trackUrl: item.external_urls?.spotify
    }
  }

  private async _getAccessToken (): Promise<string> {
    const now = Date.now()
    if (this.accessToken != null && now < this.accessTokenExpiresAt) {
      return this.accessToken
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.options.refreshToken
    })

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString('base64')}`
      },
      body: body.toString()
    })

    if (!res.ok) {
      const text = await res.text()
      throw new DashboardError('Could not refresh Spotify access token', {
        status: res.status,
        body: text
      })
    }

    const data = await res.json() as SpotifyAuthResponse
    this.accessToken = data.access_token
    this.accessTokenExpiresAt = Date.now() + ((data.expires_in - 30) * 1000)

    return this.accessToken
  }

  private _invalidateAccessToken (): void {
    this.accessToken = undefined
    this.accessTokenExpiresAt = 0
  }
}
