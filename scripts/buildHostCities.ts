import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HOST_CITIES } from '../src/data/hostCities';

// NOTE: This script is a scaffold for regenerating host city match data from the
// official FIFA schedule. In environments without network access it will simply
// rewrite the current dataset. When network access is available, extend the
// `fetchSchedule` and `mapMatches` helpers to parse the schedule PDF/HTML.

interface RemoteMatchRow {
  matchNumber: number;
  stage: string;
  group: string | null;
  homeTeam: string;
  awayTeam: string;
  dateTimeLocal: string | null;
  stadium: string;
  city: string;
  country: 'USA' | 'MEX' | 'CAN';
  timeZone: string;
}

async function fetchSchedule(): Promise<RemoteMatchRow[]> {
  // Placeholder: In a networked environment, download the official PDF/HTML
  // and parse with a library like pdf-parse or cheerio. Keep nulls for any
  // kickoff times that are still TBC.
  return [];
}

function writeHostCities(content: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const target = path.resolve(__dirname, '../src/data/hostCities.ts');
  fs.writeFileSync(target, content, 'utf8');
  console.log(`hostCities written to ${target}`);
}

function serializeHostCities() {
  const header = "import type { HostCitiesById } from '../types/hostCities';\n\n";
  const body = `export const HOST_CITIES: HostCitiesById = ${JSON.stringify(HOST_CITIES, null, 2)} as const;\n`;
  writeHostCities(`${header}${body}`);
}

async function run() {
  try {
    const remoteMatches = await fetchSchedule();
    if (!remoteMatches.length) {
      console.warn('No remote matches fetched; preserving existing host city data.');
      serializeHostCities();
      return;
    }

    // TODO: map remoteMatches into HostCities when data fetching is added.
    serializeHostCities();
  } catch (err) {
    console.error('Failed to build host cities dataset', err);
    serializeHostCities();
  }
}

run();
