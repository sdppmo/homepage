'use server';

export interface BOQColumnItem {
  names: string[];
  combination: string;
  h: number;
  b: number;
  tw: number;
  tf: number;
  area: number;
  unitWeight: number;
  /** length for one column (m) */
  length: number;
  lengthType?: string;
  count: number;
  steelGrade: string;

  H1?: number;
  H2?: number;
  B1?: number;
  B2?: number;

  quantity?: number;
  isGrouped?: boolean;
  originalNames?: string[];
  originalCount?: number;
}

export interface BOQPlateAggregatedItem {
  thickness_mm: number;
  avgWidth: number;
  unitWeight: number;
  totalLength: number;
  totalCount: number;
  totalWeight: number;
  usageParts: string;
  steelGrade: string;
  mergeInfo?: string;
  thickness?: number;
}

export interface BOQRolledHGroup {
  combination: string;
  length: number;
  count: number;
  unitWeight: number;
  totalWeight: number;
  names: string[];
  steelGrade: string;
  isGrouped?: boolean;
  originalNames?: string[];
  originalCount?: number;
}

export interface BOQUnitPrices {
  mainMaterialSM420: number;
  mainMaterialSM355: number;
  subMaterial: number;
}

export type ThicknessMergeRules = Record<number, number>;

/**
 * Ported from `protected-source/boq-report.html`.
 *
 * This file is server-only by design.
 */

const steelDensity = 7850; // kg/m^3

// Rolled H section names (Combination 3)
const rolledHCombinationNames = [
  'H400×B200',
  'H450×B200',
  'H500×B200',
  'H506×B201',
  'H482×B300',
  'H488×B300',
  'H582×B300',
  'H588×B300',
  'H600×B200',
];

function isRolledHCombination(combinationName: string): boolean {
  return rolledHCombinationNames.includes(combinationName);
}

/**
 * Group BOQ items by quantity (물량 기준 그룹핑).
 * - Sort by quantity (largest first)
 * - Items with quantity < 5% of total are grouped with similar sections
 * - Similar = H, B, tw, tf within 15% tolerance AND same combination AND same steelGrade
 */
export async function groupBOQItemsByQuantity(items: BOQColumnItem[]): Promise<BOQColumnItem[]> {
  if (!items || items.length === 0) return items;

  const itemsWithQuantity = items.map((item) => {
    const quantity = item.unitWeight * item.length * item.count;
    return { ...item, quantity };
  });

  itemsWithQuantity.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  const totalQuantity = itemsWithQuantity.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const smallQuantityThreshold = totalQuantity * 0.05;

  const largeQuantityItems: BOQColumnItem[] = [];
  const smallQuantityItems: (BOQColumnItem & { quantity: number })[] = [];

  itemsWithQuantity.forEach((item) => {
    if ((item.quantity || 0) >= smallQuantityThreshold) {
      largeQuantityItems.push(item);
    } else {
      smallQuantityItems.push(item as BOQColumnItem & { quantity: number });
    }
  });

  const tolerance = 0.15;

  interface SmallItemGroup {
    items: (BOQColumnItem & { quantity: number })[];
    totalQuantity: number;
    totalCount: number;
    totalLength: number;
    names: string[];
    representative: BOQColumnItem & { quantity: number };
  }

  const groupedSmallItems: SmallItemGroup[] = [];

  smallQuantityItems.forEach((item) => {
    if (!item.h || !item.b || !item.tw || !item.tf) {
      largeQuantityItems.push(item);
      return;
    }

    let foundGroup = false;
    for (const group of groupedSmallItems) {
      if (group.items.length === 0) continue;
      const groupItem = group.items[0];
      if (!groupItem.h || !groupItem.b || !groupItem.tw || !groupItem.tf) continue;
      if (groupItem.h === 0 || groupItem.b === 0 || groupItem.tw === 0 || groupItem.tf === 0) continue;

      const hDiff = Math.abs(item.h - groupItem.h) / groupItem.h;
      const bDiff = Math.abs(item.b - groupItem.b) / groupItem.b;
      const twDiff = Math.abs(item.tw - groupItem.tw) / groupItem.tw;
      const tfDiff = Math.abs(item.tf - groupItem.tf) / groupItem.tf;
      const sameCombination = item.combination === groupItem.combination;
      const sameSteelGrade = item.steelGrade === groupItem.steelGrade;

      if (
        hDiff <= tolerance &&
        bDiff <= tolerance &&
        twDiff <= tolerance &&
        tfDiff <= tolerance &&
        sameCombination &&
        sameSteelGrade
      ) {
        group.items.push(item);
        group.totalQuantity += item.quantity || 0;
        group.totalCount += item.count || 0;
        group.totalLength += item.length * item.count || 0;
        group.names.push(...item.names);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groupedSmallItems.push({
        items: [item],
        totalQuantity: item.quantity || 0,
        totalCount: item.count || 0,
        totalLength: item.length * item.count || 0,
        names: [...item.names],
        representative: item,
      });
    }
  });

  const groupedItems: BOQColumnItem[] = groupedSmallItems.map((group) => {
    const rep = group.representative;
    const avgLength = group.totalCount > 0 ? group.totalLength / group.totalCount : rep.length;

    return {
      ...rep,
      names:
        group.names.length > 1
          ? [`${group.names[0]} 외 ${group.names.length - 1}개`]
          : group.names,
      quantity: group.totalQuantity,
      count: group.totalCount,
      length: avgLength,
      isGrouped: true,
      originalNames: group.names,
      originalCount: group.items.length,
    };
  });

  groupedItems.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  return [...largeQuantityItems, ...groupedItems];
}

/**
 * Generate Plate BOQ from column items (Built-UP sections only).
 * Excludes Rolled H (Combination 3) items.
 */
export async function generatePlateBOQ(
  items: BOQColumnItem[],
  thicknessMergeRules: ThicknessMergeRules = {}
): Promise<BOQPlateAggregatedItem[]> {
  const builtUpItems = items.filter((item) => !isRolledHCombination(item.combination));

  interface PlateData {
    thickness: number;
    type: string;
    section: string;
    width: number;
    thickness_mm: number;
    originalThickness: number;
    originalWidth?: number;
    unitWeight: number;
    totalLength: number;
    totalCount: number;
    totalWeight: number;
    steelGrade: string;
    originalTotalWeight?: number;
  }

  const plateData: Record<string, PlateData> = {};

  builtUpItems.forEach((item) => {
    const H1 = item.H1 || item.h;
    const H2 = item.H2 || item.h;
    const B1 = item.B1 || item.b;
    const B2 = item.B2 || item.b;

    const originalTw1 = item.tw;
    const originalTw2 = item.tw;
    const originalTf1 = item.tf;
    const originalTf2 = item.tf;

    const originalH1WebWidth = H1 - 2 * originalTf1;
    const originalH2WebWidth = H2 - 2 * originalTf2;

    let tw1 = item.tw;
    let tw2 = item.tw;
    let tf1 = item.tf;
    let tf2 = item.tf;

    if (thicknessMergeRules[tw1]) tw1 = thicknessMergeRules[tw1];
    if (thicknessMergeRules[tw2]) tw2 = thicknessMergeRules[tw2];
    if (thicknessMergeRules[tf1]) tf1 = thicknessMergeRules[tf1];
    if (thicknessMergeRules[tf2]) tf2 = thicknessMergeRules[tf2];

    // H1 Web Plate (tw1)
    const h1WebKey = `tw${tw1}-H1-Web`;
    if (!plateData[h1WebKey]) {
      const webWidth = H1 - 2 * tf1;
      plateData[h1WebKey] = {
        thickness: tw1,
        type: 'Web',
        section: 'H1',
        width: webWidth,
        thickness_mm: tw1,
        originalThickness: originalTw1,
        originalWidth: originalH1WebWidth,
        unitWeight: 0,
        totalLength: 0,
        totalCount: 0,
        totalWeight: 0,
        steelGrade: item.steelGrade,
      };
    }
    plateData[h1WebKey].totalLength += item.length * item.count;
    plateData[h1WebKey].totalCount += item.count;

    // H1 Flange Plate (tf1) - top and bottom (2 pieces)
    const h1FlangeKey = `tf${tf1}-H1-Flange`;
    if (!plateData[h1FlangeKey]) {
      plateData[h1FlangeKey] = {
        thickness: tf1,
        type: 'Flange',
        section: 'H1',
        width: B1,
        thickness_mm: tf1,
        originalThickness: originalTf1,
        unitWeight: 0,
        totalLength: 0,
        totalCount: 0,
        totalWeight: 0,
        steelGrade: item.steelGrade,
      };
    }
    plateData[h1FlangeKey].totalLength += item.length * item.count * 2;
    plateData[h1FlangeKey].totalCount += item.count * 2;

    // H2 Web Plate (tw2)
    const h2WebKey = `tw${tw2}-H2-Web`;
    if (!plateData[h2WebKey]) {
      const webWidth = H2 - 2 * tf2;
      plateData[h2WebKey] = {
        thickness: tw2,
        type: 'Web',
        section: 'H2',
        width: webWidth,
        thickness_mm: tw2,
        originalThickness: originalTw2,
        originalWidth: originalH2WebWidth,
        unitWeight: 0,
        totalLength: 0,
        totalCount: 0,
        totalWeight: 0,
        steelGrade: item.steelGrade,
      };
    }
    plateData[h2WebKey].totalLength += item.length * item.count;
    plateData[h2WebKey].totalCount += item.count;

    // H2 Flange Plate (tf2) - left and right (2 pieces)
    const h2FlangeKey = `tf${tf2}-H2-Flange`;
    if (!plateData[h2FlangeKey]) {
      plateData[h2FlangeKey] = {
        thickness: tf2,
        type: 'Flange',
        section: 'H2',
        width: B2,
        thickness_mm: tf2,
        originalThickness: originalTf2,
        unitWeight: 0,
        totalLength: 0,
        totalCount: 0,
        totalWeight: 0,
        steelGrade: item.steelGrade,
      };
    }
    plateData[h2FlangeKey].totalLength += item.length * item.count * 2;
    plateData[h2FlangeKey].totalCount += item.count * 2;
  });

  Object.keys(plateData).forEach((key) => {
    const plate = plateData[key];

    const originalThickness = plate.originalThickness || plate.thickness_mm;
    const originalWidth = plate.originalWidth || plate.width;
    const originalUnitWeight = (originalWidth * originalThickness * steelDensity) / 1_000_000;
    const originalTotalWeight = originalUnitWeight * plate.totalLength;

    plate.unitWeight = (plate.width * plate.thickness_mm * steelDensity) / 1_000_000;
    plate.totalWeight = plate.unitWeight * plate.totalLength;

    plate.originalTotalWeight = originalTotalWeight;
  });

  const plateByThickness: Record<string, PlateData[]> = {};
  Object.keys(plateData).forEach((key) => {
    const plate = plateData[key];
    const thickness = String(plate.thickness_mm);
    if (!plateByThickness[thickness]) plateByThickness[thickness] = [];
    plateByThickness[thickness].push(plate);
  });

  const aggregatedPlates: BOQPlateAggregatedItem[] = [];
  Object.keys(plateByThickness)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .forEach((thickness) => {
      const plates = plateByThickness[thickness];
      if (!plates || plates.length === 0) return;

      const usageParts = plates.map((p) => `${p.section} ${p.type}`).join(', ');
      const avgWidth = plates.reduce((sum, p) => sum + p.width, 0) / plates.length;
      const totalLength = plates.reduce((sum, p) => sum + p.totalLength, 0);
      const totalCount = plates.reduce((sum, p) => sum + p.totalCount, 0);
      const totalWeight = plates.reduce((sum, p) => sum + p.totalWeight, 0);
      const avgUnitWeight = totalLength > 0 ? totalWeight / totalLength : 0;
      const steelGrade = plates[0]?.steelGrade ?? 'SM420';

      aggregatedPlates.push({
        thickness_mm: parseFloat(thickness),
        avgWidth,
        unitWeight: avgUnitWeight,
        totalLength,
        totalCount,
        totalWeight,
        usageParts,
        steelGrade,
        thickness: parseFloat(thickness),
      });
    });

  return aggregatedPlates;
}

/**
 * Generate Rolled H BOQ from column items (Combination 3 only).
 */
export async function generateRolledHBOQ(items: BOQColumnItem[]): Promise<BOQRolledHGroup[]> {
  const rolledHItems = items.filter((item) => isRolledHCombination(item.combination));

  const groupedData: Record<string, BOQRolledHGroup> = {};

  rolledHItems.forEach((item) => {
    const key = `${item.combination}-${item.length.toFixed(2)}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        combination: item.combination,
        length: item.length,
        count: 0,
        unitWeight: item.unitWeight,
        totalWeight: 0,
        names: [],
        steelGrade: item.steelGrade,
      };
    }
    groupedData[key].count += item.count;
    groupedData[key].totalWeight += item.unitWeight * item.length * item.count;
    groupedData[key].names.push(...item.names);
  });

  return Object.values(groupedData);
}

/**
 * Group Rolled H items by quantity (similar to groupBOQItemsByQuantity).
 */
export async function groupRolledHItemsByQuantity(groups: BOQRolledHGroup[]): Promise<BOQRolledHGroup[]> {
  if (!groups || groups.length === 0) return groups;

  groups.sort((a, b) => (b.totalWeight || 0) - (a.totalWeight || 0));

  const totalQuantity = groups.reduce((sum, group) => sum + (group.totalWeight || 0), 0);
  const smallQuantityThreshold = totalQuantity * 0.05;

  const largeQuantityItems: BOQRolledHGroup[] = [];
  const smallQuantityItems: BOQRolledHGroup[] = [];

  groups.forEach((group) => {
    if ((group.totalWeight || 0) >= smallQuantityThreshold) {
      largeQuantityItems.push(group);
    } else {
      smallQuantityItems.push(group);
    }
  });

  const tolerance = 0.15;

  interface SmallRolledHGroup {
    items: BOQRolledHGroup[];
    totalWeight: number;
    totalCount: number;
    names: string[];
    representative: BOQRolledHGroup;
  }

  const groupedSmallItems: SmallRolledHGroup[] = [];

  smallQuantityItems.forEach((group) => {
    if (!group.combination || !group.length) {
      largeQuantityItems.push(group);
      return;
    }

    let foundGroup = false;
    for (const g of groupedSmallItems) {
      if (g.items.length === 0) continue;
      const gGroup = g.items[0];
      if (!gGroup.combination || !gGroup.length || gGroup.length === 0) continue;

      const sameCombination = group.combination === gGroup.combination;
      const lengthDiff = Math.abs(group.length - gGroup.length) / gGroup.length;

      if (sameCombination && lengthDiff <= tolerance) {
        g.items.push(group);
        g.totalWeight += group.totalWeight || 0;
        g.totalCount += group.count || 0;
        g.names = [...new Set([...g.names, ...group.names])];
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groupedSmallItems.push({
        items: [group],
        totalWeight: group.totalWeight || 0,
        totalCount: group.count || 0,
        names: [...group.names],
        representative: group,
      });
    }
  });

  const groupedItems: BOQRolledHGroup[] = groupedSmallItems.map((g) => {
    const rep = g.representative;
    return {
      ...rep,
      names: g.names.length > 1 ? [`${g.names[0]} 외 ${g.names.length - 1}개`] : g.names,
      totalWeight: g.totalWeight,
      count: g.totalCount,
      isGrouped: true,
      originalNames: g.names,
      originalCount: g.items.length,
    };
  });

  groupedItems.sort((a, b) => (b.totalWeight || 0) - (a.totalWeight || 0));

  return [...largeQuantityItems, ...groupedItems];
}

/**
 * Calculate BOQ totals and amounts.
 */
export interface BOQTotals {
  totalCount: number;
  totalArea: number;
  totalWeight: number;
  totalColumnAmount: number;
}

export async function calculateBOQTotals(items: BOQColumnItem[], unitPrices: BOQUnitPrices): Promise<BOQTotals> {
  let totalCount = 0;
  let totalArea = 0;
  let totalWeight = 0;
  let totalColumnAmount = 0;

  items.forEach((item) => {
    const itemWeight = item.unitWeight * item.length * item.count;
    totalCount += item.count;
    totalArea += item.area * item.count;
    totalWeight += itemWeight;

    const weightInTon = itemWeight / 1000;
    let unitPrice = unitPrices.mainMaterialSM420;

    if (item.steelGrade === 'SM355' || item.steelGrade.includes('SM355')) {
      unitPrice = unitPrices.mainMaterialSM355;
    } else if (item.steelGrade === 'SM420' || item.steelGrade.includes('SM420')) {
      unitPrice = unitPrices.mainMaterialSM420;
    }

    totalColumnAmount += weightInTon * unitPrice;
  });

  return { totalCount, totalArea, totalWeight, totalColumnAmount };
}

/**
 * Calculate sub-material (소부재) BOQ.
 * Sub-material is typically 15% of total steel weight.
 */
export interface SubMaterialBOQItem {
  type: string;
  spec: string;
  unit: string;
  quantity: number | null;
  steelGrade: string;
  mainMaterialWeight: number;
  surcharge: number;
  unitPrice: number;
  amount: number;
  remark: string;
}

export async function calculateSubMaterialBOQ(
  columnTotalWeight: number,
  unitPrices: BOQUnitPrices,
  surchargeRate: number = 0.15
): Promise<SubMaterialBOQItem[]> {
  const surcharge = columnTotalWeight * surchargeRate;
  const surchargeInTon = surcharge / 1000;
  const amount = surchargeInTon * unitPrices.subMaterial;

  return [
    {
      type: '3 PLATE',
      spec: '접합부',
      unit: 'Ton',
      quantity: null,
      steelGrade: 'SM355/SM420',
      mainMaterialWeight: columnTotalWeight,
      surcharge,
      unitPrice: unitPrices.subMaterial,
      amount,
      remark: '전체 철골물량의 15%',
    },
  ];
}

/**
 * Group Plate items by quantity (similar to groupBOQItemsByQuantity).
 */
export async function groupPlateItemsByQuantity(
  plates: BOQPlateAggregatedItem[],
  thicknessMergeRules: ThicknessMergeRules = {}
): Promise<BOQPlateAggregatedItem[]> {
  if (!plates || plates.length === 0) return plates;

  plates.sort((a, b) => (b.totalWeight || 0) - (a.totalWeight || 0));

  const totalQuantity = plates.reduce((sum, plate) => sum + (plate.totalWeight || 0), 0);
  const smallQuantityThreshold = totalQuantity * 0.05;

  const largeQuantityItems: BOQPlateAggregatedItem[] = [];
  const smallQuantityItems: BOQPlateAggregatedItem[] = [];

  plates.forEach((plate) => {
    if ((plate.totalWeight || 0) >= smallQuantityThreshold) {
      largeQuantityItems.push(plate);
    } else {
      smallQuantityItems.push(plate);
    }
  });

  const tolerance = 0.15;

  interface SmallPlateGroup {
    items: BOQPlateAggregatedItem[];
    totalWeight: number;
    totalCount: number;
    totalLength: number;
    usageParts: string;
    representative: BOQPlateAggregatedItem;
    originalThicknessMap: Record<number, number>;
  }

  const groupedSmallItems: SmallPlateGroup[] = [];

  smallQuantityItems.forEach((plate) => {
    if (!plate.thickness_mm || !plate.avgWidth) {
      largeQuantityItems.push(plate);
      return;
    }

    let adjustedThickness = plate.thickness_mm;
    if (thicknessMergeRules[plate.thickness_mm]) {
      adjustedThickness = thicknessMergeRules[plate.thickness_mm];
    }

    let foundGroup = false;
    for (const group of groupedSmallItems) {
      if (group.items.length === 0) continue;
      const groupPlate = group.items[0];
      if (!groupPlate.thickness_mm || !groupPlate.avgWidth || groupPlate.thickness_mm === 0 || groupPlate.avgWidth === 0) continue;

      const thicknessMatch = adjustedThickness === groupPlate.thickness_mm;
      const thicknessDiff = Math.abs(adjustedThickness - groupPlate.thickness_mm) / groupPlate.thickness_mm;
      const widthDiff = Math.abs(plate.avgWidth - groupPlate.avgWidth) / groupPlate.avgWidth;

      if (thicknessMatch || (thicknessDiff <= tolerance && widthDiff <= tolerance)) {
        group.items.push(plate);
        group.totalWeight += plate.totalWeight || 0;
        group.totalCount += plate.totalCount || 0;
        group.totalLength += plate.totalLength || 0;
        group.usageParts = [...new Set([...group.usageParts.split(', '), ...plate.usageParts.split(', ')])].join(
          ', '
        );

        const originalThick = plate.thickness_mm;
        if (!group.originalThicknessMap[originalThick]) {
          group.originalThicknessMap[originalThick] = 0;
        }
        group.originalThicknessMap[originalThick] += plate.totalWeight || 0;

        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      const originalThick = plate.thickness_mm;
      groupedSmallItems.push({
        items: [plate],
        totalWeight: plate.totalWeight || 0,
        totalCount: plate.totalCount || 0,
        totalLength: plate.totalLength || 0,
        usageParts: plate.usageParts,
        representative: plate,
        originalThicknessMap: { [originalThick]: plate.totalWeight || 0 },
      });
    }
  });

  const groupedItems: BOQPlateAggregatedItem[] = groupedSmallItems.map((group) => {
    const rep = group.representative;
    const avgUnitWeight = group.totalLength > 0 ? group.totalWeight / group.totalLength : rep.unitWeight;

    const mergeInfoParts: string[] = [];
    Object.keys(group.originalThicknessMap)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .forEach((thick) => {
        const weight = group.originalThicknessMap[parseFloat(thick)];
        mergeInfoParts.push(`${thick}mm: ${weight.toFixed(2)}kg`);
      });
    const mergeInfo =
      mergeInfoParts.length > 0
        ? `${mergeInfoParts.join(', ')} → ${rep.thickness_mm}mm: ${group.totalWeight.toFixed(2)}kg`
        : '';

    return {
      ...rep,
      usageParts: group.usageParts,
      totalWeight: group.totalWeight,
      totalCount: group.totalCount,
      totalLength: group.totalLength,
      unitWeight: avgUnitWeight,
      mergeInfo,
    };
  });

  groupedItems.sort((a, b) => (b.totalWeight || 0) - (a.totalWeight || 0));
  return [...largeQuantityItems, ...groupedItems];
}
