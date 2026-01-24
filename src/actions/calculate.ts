'use server';

import { calculateSection, type CrossHSectionCalcInput, type CrossHSectionCalcResult } from '../lib/calculations/cross-h-column';
import {
  findOptimalSection as findOptimalSectionCalc,
  type OptimalSectionSearchInput,
  type OptimalSectionSearchResult,
} from '../lib/calculations/steel-section';
import {
  calculateBOQTotals,
  generatePlateBOQ,
  type BOQColumnItem,
  type BOQPlateAggregatedItem,
  type BOQTotals,
  type BOQUnitPrices,
} from '../lib/calculations/boq';

/**
 * Server Actions wrapper for calculation modules.
 *
 * IMPORTANT: keep this file server-only to prevent calculation code from
 * being included in client bundles.
 */

export async function calculateCrossHColumn(input: CrossHSectionCalcInput): Promise<CrossHSectionCalcResult> {
  return calculateSection(input);
}

export async function findOptimalSection(input: OptimalSectionSearchInput): Promise<OptimalSectionSearchResult> {
  return findOptimalSectionCalc(input);
}

export interface GenerateBOQInput {
  items: BOQColumnItem[];
  unitPrices: BOQUnitPrices;
  thicknessMergeRules?: Record<number, number>;
}

export interface GenerateBOQResult {
  totals: BOQTotals;
  plates: BOQPlateAggregatedItem[];
}

export async function generateBOQ(input: GenerateBOQInput): Promise<GenerateBOQResult> {
  const totals = await calculateBOQTotals(input.items, input.unitPrices);
  const plates = await generatePlateBOQ(input.items, input.thicknessMergeRules ?? {});
  return { totals, plates };
}
