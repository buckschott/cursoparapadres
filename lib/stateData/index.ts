/**
 * State Data Index
 * Aggregates all regional files and exports unified STATE_DATA object
 * 
 * Structure:
 * - types.ts (shared interfaces)
 * - texas.ts (254 counties - biggest Hispanic market)
 * - florida.ts (67 counties - mandatory by law, 45-day deadline)
 * - georgia.ts (159 counties - county-by-county rules, legitimation cases)
 * - south-atlantic.ts (DC, DE, MD, NC, SC, VA, WV)
 * - south-central.ts (AL, AR, KY, LA, MS, OK, TN)
 * - midwest-east.ts (IL, IN, MI, OH, WI)
 * - midwest-west.ts (IA, KS, MN, MO, NE, ND, SD)
 * - northeast.ts (CT, MA, ME, NH, NJ, NY, PA, RI, VT)
 * - west-mountain.ts (AZ, CO, ID, MT, NV, NM, UT, WY)
 * - west-pacific.ts (AK, CA, HI, OR, WA)
 */

import type { StateData } from './types';
import { texasStates } from './texas';
import { floridaStates } from './florida';
import { georgiaStates } from './georgia';
import { southAtlanticStates } from './south-atlantic';
import { southCentralStates } from './south-central';
import { midwestEastStates } from './midwest-east';
import { midwestWestStates } from './midwest-west';
import { northeastStates } from './northeast';
import { westMountainStates } from './west-mountain';
import { westPacificStates } from './west-pacific';

// Combine all regions into single STATE_DATA object
export const STATE_DATA: Record<string, StateData> = {
  ...texasStates,
  ...floridaStates,
  ...georgiaStates,
  ...southAtlanticStates,
  ...southCentralStates,
  ...midwestEastStates,
  ...midwestWestStates,
  ...northeastStates,
  ...westMountainStates,
  ...westPacificStates,
};

// Helper functions
export function getStateData(slug: string): StateData | undefined {
  return STATE_DATA[slug];
}

export function getAllStateSlugs(): string[] {
  return Object.keys(STATE_DATA);
}

export function getStateCount(): number {
  return Object.keys(STATE_DATA).length;
}

export function getTotalCountyCount(): number {
  return Object.values(STATE_DATA).reduce((sum, state) => sum + state.countyCount, 0);
}

// Re-export types
export type { StateData, County, FAQ } from './types';
