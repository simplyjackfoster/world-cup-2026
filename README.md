# World Cup 2026 – React + TypeScript + Tailwind

A single-page mock experience for the 2026 World Cup with groups, fixtures, knockout bracket, predictions, host cities, and a "My Teams" rail. All data is static and lives in `src/data`.

## Architecture
- **React + Vite + TypeScript** with Tailwind styling and a small router.
- **Context store** (`TournamentContext`) holds standings, prediction picks, favorites, and mode (results vs prediction).
- **Data-first**: groups, fixtures, bracket slots, and stadiums live in `src/data`. Comments in components mark where live APIs could plug in later.
- **Reusable components**: `GroupTable`, `GroupGrid`, `GroupDetail`, `FixtureList`, `MatchModal`, `Bracket`, `PredictionSidebar`, `HostCityExplorer`, and `MyTeams` compose the pages.
- **Responsive UI**: cards and bracket scroll horizontally on mobile, with sticky stage labels.

## Running locally
```
npm install
npm run dev
```
Vite will start on http://localhost:5173 by default.

## Scripts
- `npm run dev` – start local dev server
- `npm run build` – type-check and build for production
- `npm run preview` – preview the production build

## Notes
- Predictions default to the current standings; switching to **Prediction mode** lets you reorder group tables and click teams in the bracket to push them forward.
- The mock also includes a Host City explorer with stadium info and fixture links into the match modal.

## Host cities data
- Data model lives in `src/types/hostCities.ts` and the static dataset in `src/data/hostCities.ts`.
- A scaffolding script (`scripts/buildHostCities.ts`) is included to rebuild the dataset from the official FIFA match schedule PDF/HTML when network access is available. The current environment was offline, so matches are empty placeholders until the script can pull authoritative data.
- Run `ts-node scripts/buildHostCities.ts` after enabling network access to refresh the dataset.
