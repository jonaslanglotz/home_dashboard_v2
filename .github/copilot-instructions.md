# Home Dashboard V2 - AI Coding Assistant Instructions

## Architecture Overview

This is a personal dashboard with a **TypeScript backend** (server/) and **SvelteKit frontend** (web/) communicating via WebSockets. The backend periodically fetches data from external APIs (weather, transit, calendar, energy, tasks) and broadcasts updates to connected clients.

### Key Components

- **DataModel** (`server/src/data/data-model.ts`): Central registry that instantiates and manages all data providers based on env config
- **IntervalBasedDataProvider** (`server/src/data/interval-based-data-provider.ts`): Wraps providers to poll at configured intervals, emits DATA_EVENT on updates
- **WebSocketBroadcaster** (`server/src/websocket/websocket-broadcaster.ts`): Manages WS connections, broadcasts data updates to all clients, retransmits current state on new connections
- **shared-types.d.ts**: TypeScript interfaces shared between server and web (WeatherData, Tasks, Events, TrainDepartures, EnergyPrices, EnergyUseData)

### Data Flow

1. DataModel creates IntervalBasedDataProvider instances (one per data source like PirateWeather, Todoist, BVG)
2. Each provider polls its API at configured intervals (e.g., `PIRATE_WEATHER_FETCH_INTERVAL`)
3. On data fetch, IntervalBasedDataProvider emits DATA_EVENT → DataModel updates currentState and emits to WebSocketBroadcaster
4. WebSocketBroadcaster sends `{ type: 'WEATHER', data: {...} }` to all connected clients
5. Frontend (+layout.svelte) listens for WS events, updates Svelte stores, components reactively update

## Development Workflows

### Running the Application

**Server:**
```bash
cd server
npm run dev  # Uses nodemon for hot reload
```

**Web:**
```bash
cd web
npm run dev  # Vite dev server
```

### Testing

- **Unit tests**: `cd server && npm test` (runs `test/unit/**/*.test.ts` with nyc coverage)
- **Integration tests**: `cd server && npm run integration-test` (runs `test/integration/**/*.test.ts`, requires `.env` with real API keys)
- Use Mocha + Chai + Sinon (stub `global.fetch` in unit tests, see `pirate-weather.test.ts`)
- Coverage excludes logging/error utility files (see nyc config in package.json)

### Adding a New Data Provider

1. Define types in `shared-types.d.ts`
2. Create provider in `server/src/data/data-providers/` extending DataProvider<T>
   - Implement `getData(): Promise<T>`
   - Export `fromEnv(envConfig)` factory function
   - Add private `_getRawData()` method for API calls
3. Add env config to `server/src/env.ts` using `readEnv()` with nested spec (see PIRATE_WEATHER example)
4. Register in DataModel._createDataProviders() with IntervalBasedDataProvider wrapper
5. Add Svelte store in `web/src/lib/stores.ts`
6. Wire up WS event listener in `web/src/routes/+layout.svelte`
7. Create unit tests (mock fetch) and integration tests (real API, requires .env)

## Project-Specific Conventions

### Environment Configuration

Uses **custom env validation system** (not envalid despite being in deps). See `server/src/env/`:
- `readEnv(process.env, spec)` validates and parses env vars, exits with detailed errors if validation fails
- Use `str()`, `int()`, `float()` from `spec.ts` for type-safe specs
- Group related vars in nested objects (e.g., `env.PIRATE_WEATHER.PIRATE_WEATHER_API_KEY`)
- Integration tests use `dotenv/config` + `readEnv()` pattern

### Logging

- Import from `server/src/utils/log.ts` → exports pino logger
- Classes extending `WithLogger` or `DataProvider` get `this._log` (pino child logger with module name)
- Standalone modules use `log.child({ module: 'module-name' })`

### Error Handling

- Custom `DashboardError` class in `server/src/utils/dashboard-error.ts`
- IntervalBasedDataProvider catches errors from getData(), logs them, continues polling (doesn't crash)

### Frontend Patterns

- **Stores**: One writable store per data type in `stores.ts`, components subscribe with `$weatherDataStore`
- **WebSocket**: Single WSConnection instance created in +layout.svelte (browser check), auto-reconnects on disconnect
- **Type safety**: Import types from `../../../shared-types` (relative path from web/ to root)
- **Tailwind**: All styling via Tailwind classes, config in `tailwind.config.js`

## Integration Points

- **External APIs**: PirateWeather (weather), Todoist (tasks), BVG HAFAS (train departures), Tibber (energy prices), iCal (calendar), Kostal Modbus (solar/battery data)
- **WebSocket Protocol**: JSON messages with `{ type: string, data: any }` structure
- **Shared Types**: Single source of truth in root `shared-types.d.ts`, imported by both server and web

## Key Files to Reference

- `server/src/data/data-providers/pirate-weather.ts`: Example provider with API types and data transformation
- `server/test/unit/data/data-providers/pirate-weather.test.ts`: Unit test pattern (stub fetch, validate output)
- `server/test/integration/data/data-providers/pirate-weather.test.ts`: Integration test pattern (real API call)
- `web/src/lib/wsConnection.ts`: WebSocket client with reconnection logic and type guards
