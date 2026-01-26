'use server';

import { createClient } from '../lib/supabase/server';
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

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return user;
}

export async function calculateCrossHColumn(input: CrossHSectionCalcInput): Promise<CrossHSectionCalcResult> {
  await requireAuth();
  return calculateSection(input);
}

export async function findOptimalSection(input: OptimalSectionSearchInput): Promise<OptimalSectionSearchResult> {
  await requireAuth();
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
  await requireAuth();
  const totals = await calculateBOQTotals(input.items, input.unitPrices);
  const plates = await generatePlateBOQ(input.items, input.thicknessMergeRules ?? {});
  return { totals, plates };
}
