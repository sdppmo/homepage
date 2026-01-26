'use server';

export interface MaterialInput {
  Fy: number;
  E: number;
  nu: number;
}

export interface EffectiveLengthFactorsInput {
  Kx: number;
  Ky: number;
  Kz: number;
}

export interface MemberLengthsInput {
  /** mm */
  Lx: number;
  /** mm */
  Ly: number;
}

export interface PMMLoadInput {
  Pu: number;
  Mux: number;
  Muy: number;
}

export interface CrossHSectionDimensionsInput {
  h1: number;
  h2: number;
  b1: number;
  b2: number;
}

export interface OptimalSectionSearchInput {
  loads: PMMLoadInput;
  material: MaterialInput;
  factors: EffectiveLengthFactorsInput;
  lengths: MemberLengthsInput;
  dims: CrossHSectionDimensionsInput;
  /** default 1.0 */
  pmmLimit?: number;
  twMin: number;
  twMax: number;
  tfMin: number;
  tfMax: number;
}

export interface OptimalSectionSearchResult {
  tw: number | null;
  tf: number | null;
  area: number;
  ratioPMM: number;
  isSlenderFlange: boolean;
}

import {
  calculateSectionByInputs,
  getCombinations as getCombos,
  getRolledHStandardThickness,
} from './cross-h-column';

/**
 * Ported EXACTLY from `protected-source/auto-find-section.html`.
 *
 * This file is server-only by design.
 */

export async function getCombinations() {
  return getCombos();
}

// getTwRange()/getTfRange() in HTML read from DOM inputs.
// In server-side version, the caller must pass explicit min/max.
export async function getTwRange(twMin: number, twMax: number): Promise<number[]> {
  const range: number[] = [];
  for (let i = twMin; i <= twMax; i++) {
    range.push(i);
  }
  return range;
}

export async function getTfRange(tfMin: number, tfMax: number): Promise<number[]> {
  const range: number[] = [];
  for (let i = tfMin; i <= tfMax; i++) {
    range.push(i);
  }
  return range;
}

function hasOwn(obj: object, key: string | number): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isCombination3(h1: number, b1: number): boolean {
  const thickness = rolledHStandardThicknessCache;
  const hasStandardH = hasOwn(thickness, h1);
  return (
    hasStandardH &&
    (b1 === 200 ||
      b1 === 201 ||
      (b1 === 300 && (h1 === 482 || h1 === 488 || h1 === 582 || h1 === 588)))
  );
}

let rolledHStandardThicknessCache: Record<number, { tw: number; tf: number; r: number }> = {};
async function getRolledThicknessCache() {
  if (Object.keys(rolledHStandardThicknessCache).length === 0) {
    rolledHStandardThicknessCache = await getRolledHStandardThickness();
  }
  return rolledHStandardThicknessCache;
}

/**
 * Port of `findOptimalSection()` from `protected-source/auto-find-section.html`.
 */
export async function findOptimalSection(input: OptimalSectionSearchInput): Promise<OptimalSectionSearchResult> {
  const { loads, material, factors, lengths, dims } = input;
  const { Pu, Mux, Muy } = loads;
  const { Fy, E, nu } = material;
  const { Kx, Ky, Kz } = factors;
  const { Lx, Ly } = lengths;
  const { h1, h2, b1, b2 } = dims;

  let bestTw: number | null = null;
  let bestTf: number | null = null;
  let bestArea = Infinity;
  let bestPMM = 0;
  let bestDiff = Infinity;
  let bestIsSlenderFlange = false;

  const pmmLimit = input.pmmLimit ?? 1.0;

  const rolledHStandardThickness = await getRolledThicknessCache();
  const comb3 = isCombination3(h1, b1);

  let twRange: number[];
  let tfRange: number[];

  if (comb3) {
    const standardThickness = rolledHStandardThickness[h1];
    const standardTw = standardThickness.tw;
    const standardTf = standardThickness.tf;
    twRange = [standardTw];
    tfRange = [standardTf];
  } else {
    twRange = [];
    tfRange = [];
    for (let i = input.twMin; i <= input.twMax; i++) twRange.push(i);
    for (let i = input.tfMin; i <= input.tfMax; i++) tfRange.push(i);
  }

  for (const tw of twRange) {
    for (const tf of tfRange) {
      if (tf < tw) continue;

      const result = await calculateSectionByInputs(
        tw,
        tf,
        Fy,
        E,
        nu,
        Kx,
        Ky,
        Kz,
        Lx,
        Ly,
        Pu,
        Mux,
        Muy,
        h1,
        h2,
        b1,
        b2
      );

      if (result.isSlenderFlange) continue;
      if (result.isSlenderWeb) continue;

      if (result.ratio_pmm > 0 && result.ratio_pmm <= pmmLimit) {
        if (result.area < bestArea) {
          bestArea = result.area;
          bestTw = tw;
          bestTf = tf;
          bestPMM = result.ratio_pmm;
          bestDiff = Math.abs(pmmLimit - result.ratio_pmm);
          bestIsSlenderFlange = result.isSlenderFlange;
        }
      }
    }
  }

  if (bestTw === null) {
    let minPMM = Infinity;
    const twRange2 = comb3
      ? twRange
      : (() => {
          const r: number[] = [];
          for (let i = input.twMin; i <= input.twMax; i++) r.push(i);
          return r;
        })();
    const tfRange2 = comb3
      ? tfRange
      : (() => {
          const r: number[] = [];
          for (let i = input.tfMin; i <= input.tfMax; i++) r.push(i);
          return r;
        })();

    for (const tw of twRange2) {
      for (const tf of tfRange2) {
        if (tf < tw) continue;

        const result = await calculateSectionByInputs(
          tw,
          tf,
          Fy,
          E,
          nu,
          Kx,
          Ky,
          Kz,
          Lx,
          Ly,
          Pu,
          Mux,
          Muy,
          h1,
          h2,
          b1,
          b2
        );

        if (result.isSlenderFlange) continue;
        if (result.isSlenderWeb) continue;
        if (result.isCompressiveNG) continue;

        if (result.ratio_pmm < minPMM) {
          minPMM = result.ratio_pmm;
          bestArea = result.area;
          bestTw = tw;
          bestTf = tf;
          bestPMM = result.ratio_pmm;
          bestIsSlenderFlange = result.isSlenderFlange;
        }
      }
    }
  }

  void bestDiff;

  return {
    tw: bestTw,
    tf: bestTf,
    area: bestArea,
    ratioPMM: bestPMM,
    isSlenderFlange: bestIsSlenderFlange,
  };
}
