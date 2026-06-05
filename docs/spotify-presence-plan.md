# Spotify "Now Playing" Overlay Plan

## Goal & Constraints
- Show a Jonas-only overlay with current Spotify track info + album art while Jonas is at home and audio is actively playing.
- Overlay hides the usual dashboard UI and reverts after playback stops/pauses for a grace period.
- Feature must be disabled unless `.env` provides both Spotify + Home Assistant credentials.
- Presence data should be pushed via the Home Assistant companion WebSocket, while Spotify playback is polled every second with backoff on rate limits.

## Backend Plan

### 1. Environment & Types
- Extend `server/src/env.ts` with an optional `SPOTIFY_OVERLAY` group containing:
  - `HOME_ASSISTANT_WS_URL`, `HOME_ASSISTANT_TOKEN`, `HOME_ASSISTANT_PRESENCE_ENTITY` (e.g., `person.jonas`).
  - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` to mint access tokens.
  - `SPOTIFY_MIN_RESUME_INTERVAL` (ms) to keep overlay visible briefly after pauses.
- Update `shared-types.d.ts` with `SpotifyTrack` + `SpotifyOverlayState` describing `isVisible`, `lastUpdated`, album art URL, artist(s), track name, progress, duration, etc.

### 2. Presence Listener (Home Assistant)
- Add a `HomeAssistantPresenceClient` under `server/src/data/data-providers/presence` that:
  - Maintains a WebSocket connection using HA's authentication handshake.
  - Subscribes to the configured entity via the `subscribe_events` API to receive state changes.
  - Emits normalized presence events (`home`, `not_home`, `unknown`). Automatically reconnect with exponential backoff.

### 3. Spotify Poller
- Implement `SpotifyNowPlayingClient` that manages OAuth token refresh and calls `GET /v1/me/player/currently-playing`.
- Poll every second while `is_playing` is true; increase interval after 429 using server-provided `Retry-After` or custom exponential backoff, and slow down (e.g., 15s) when nothing is playing.
- Only keep the poller active while Jonas is reported `home`; suspend polling entirely when presence says otherwise to avoid unnecessary Spotify calls.
- Normalize responses into `SpotifyTrack` objects, capturing album art, artists, progress, etc.

### 4. Overlay State Manager
- Create a coordinator (e.g., `SpotifyOverlayProvider` implementing `DataProvider<SpotifyOverlayState>`) that:
  - Listens to presence events and Spotify poll results.
  - Only emits overlay data when presence reports `home` AND Spotify reports an active track.
  - Emits `{ isVisible: false }` when presence leaves home, Spotify stops, or data is stale beyond `SPOTIFY_MIN_RESUME_INTERVAL`.
  - Handles timers so that short pauses/seek events do not flicker (use configurable grace period).
  - Expose this provider through a custom emitter rather than `IntervalBasedDataProvider` (event-driven); wire it into `DataModel` as `NOW_PLAYING_OVERLAY` when the env group exists.

### 5. WebSocket Broadcast
- Ensure `DataModel` stores the latest overlay state and broadcasts updates via `WebSocketBroadcaster` alongside the existing data types.
- Add serialization guards so undefined overlay data is not sent until first real payload.

### 6. Testing Strategy
- Unit-test Spotify poller token refresh/backoff and presence client parsing (mocking WebSocket messages).
- Add integration-style test to confirm `SpotifyOverlayProvider` emits `isVisible` toggles when presence/spotify data change.

## Frontend Plan

### 1. Shared Stores & Messages
- Extend `web/src/lib/stores.ts` with `spotifyOverlayStore` (type `SpotifyOverlayState | undefined`).
- Update `+layout.svelte` to listen for the `NOW_PLAYING_OVERLAY` websocket event and push into the store.

### 2. UI Component
- Create `src/lib/components/nowPlaying/NowPlayingOverlay.svelte` as a structural skeleton (basic markup with placeholders for album art, track title, artists, elapsed time); keep it intentionally unstyled so Jonas can handle the visual design.
- Accept `SpotifyOverlayState` and handle `isVisible` internally, including fade/transition hooks, but leave all actual styling tokens/classes blank or minimal.

### 3. Jonas Page Toggle Logic
- In `src/routes/jonas/+page.svelte`, subscribe to `spotifyOverlayStore`.
- When `overlay.isVisible` is true, render the now-playing overlay full-screen and hide the existing dashboard grid.
- When the overlay becomes false or undefined, revert immediately; optionally keep last overlay for a short fade-out based on `overlay.lastUpdated` if server-supplied timestamp is older than the grace period.

### 4. Configuration-Driven Rendering
- Guard the overlay logic so other pages remain unaffected; `/david` etc. keep default layout.

## Deployment & Ops
- Document new `.env` keys in `server/.env.example` and mention required Spotify + HA setup (refresh tokens, entity ids).
- Consider logging/metrics for reconnection issues and Spotify rate-limit handling.
