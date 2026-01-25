'use server';

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

export async function calculateGroupedBOQ(
  items: BOQColumnItem[]
): Promise<BOQColumnItem[]> {
  return groupBOQItemsByQuantity(items);
}

export async function calculatePlateBOQ(
  items: BOQColumnItem[],
  thicknessMergeRules?: ThicknessMergeRules
): Promise<BOQPlateAggregatedItem[]> {
  return generatePlateBOQ(items, thicknessMergeRules);
}

export async function calculateRolledHBOQ(
  items: BOQColumnItem[]
): Promise<BOQRolledHGroup[]> {
  return generateRolledHBOQ(items);
}

export async function calculateGroupedRolledHBOQ(
  groups: BOQRolledHGroup[]
): Promise<BOQRolledHGroup[]> {
  return groupRolledHItemsByQuantity(groups);
}

export async function calculateBOQTotalValues(
  items: BOQColumnItem[],
  unitPrices: BOQUnitPrices
) {
  return calculateBOQTotals(items, unitPrices);
}

export async function calculateSubMaterial(
  columnTotalWeight: number,
  unitPrices: BOQUnitPrices,
  surchargeRate?: number
): Promise<SubMaterialBOQItem[]> {
  return calculateSubMaterialBOQ(columnTotalWeight, unitPrices, surchargeRate);
}

export async function calculateGroupedPlateBOQ(
  plates: BOQPlateAggregatedItem[],
  thicknessMergeRules?: ThicknessMergeRules
): Promise<BOQPlateAggregatedItem[]> {
  return groupPlateItemsByQuantity(plates, thicknessMergeRules);
}
