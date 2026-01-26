'use server';

import { createClient } from '@/lib/supabase/server';
import {
  BOQColumnItem,
  BOQPlateAggregatedItem,
  BOQRolledHGroup,
  BOQUnitPrices,
  SubMaterialBOQItem,
  ThicknessMergeRules,
  groupBOQItemsByQuantity,
  generatePlateBOQ,
  generateRolledHBOQ,
  groupRolledHItemsByQuantity,
  calculateBOQTotals,
  calculateSubMaterialBOQ,
  groupPlateItemsByQuantity,
} from '@/lib/calculations/boq';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return user;
}

export async function calculateGroupedBOQ(
  items: BOQColumnItem[]
): Promise<BOQColumnItem[]> {
  await requireAuth();
  return groupBOQItemsByQuantity(items);
}

export async function calculatePlateBOQ(
  items: BOQColumnItem[],
  thicknessMergeRules?: ThicknessMergeRules
): Promise<BOQPlateAggregatedItem[]> {
  await requireAuth();
  return generatePlateBOQ(items, thicknessMergeRules);
}

export async function calculateRolledHBOQ(
  items: BOQColumnItem[]
): Promise<BOQRolledHGroup[]> {
  await requireAuth();
  return generateRolledHBOQ(items);
}

export async function calculateGroupedRolledHBOQ(
  groups: BOQRolledHGroup[]
): Promise<BOQRolledHGroup[]> {
  await requireAuth();
  return groupRolledHItemsByQuantity(groups);
}

export async function calculateBOQTotalValues(
  items: BOQColumnItem[],
  unitPrices: BOQUnitPrices
) {
  await requireAuth();
  return calculateBOQTotals(items, unitPrices);
}

export async function calculateSubMaterial(
  columnTotalWeight: number,
  unitPrices: BOQUnitPrices,
  surchargeRate?: number
): Promise<SubMaterialBOQItem[]> {
  await requireAuth();
  return calculateSubMaterialBOQ(columnTotalWeight, unitPrices, surchargeRate);
}

export async function calculateGroupedPlateBOQ(
  plates: BOQPlateAggregatedItem[],
  thicknessMergeRules?: ThicknessMergeRules
): Promise<BOQPlateAggregatedItem[]> {
  await requireAuth();
  return groupPlateItemsByQuantity(plates, thicknessMergeRules);
}
