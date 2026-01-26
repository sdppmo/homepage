'use server';

export type WebClass = 'Compact' | 'Noncompact' | 'Slender';

export interface CrossHSectionDimensionsInput {
  h1: number;
  h2: number;
  b1: number;
  b2: number;
}

export interface CrossHThicknessInput {
  tw: number;
  tf: number;
}

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

export interface CrossHSectionCalcInput {
  thickness: CrossHThicknessInput;
  material: MaterialInput;
  factors: EffectiveLengthFactorsInput;
  lengths: MemberLengthsInput;
  loads: PMMLoadInput;
  dims: CrossHSectionDimensionsInput;
}

export interface CrossHSectionCalcResult {
  phi_Pn: number;
  area: number;
  ratio_pmm: number;
  tw: number;
  tf: number;
  lcf: number;
  lcfr: number;
  isSlenderFlange: boolean;
  isCompressiveNG: boolean;

  // web slenderness (flexure)
  lw1: number;
  lw2: number;
  lwp: number;
  lwr: number;
  web1Class: WebClass;
  web2Class: WebClass;
  isSlenderWeb: boolean;

  lfp: number;
  lfr: number;
  lf1: number;
  lf2: number;
  flange1Class: WebClass;
  flange2Class: WebClass;

  phi_Mnx: number;
  phi_Mny: number;

  phi_Vnx: number;
  phi_Vny: number;
}

export interface SectionCombination {
  H1: number;
  H2: number;
  B1: number;
  B2: number;
  name: string;
}

export interface CalculateSectionArgs {
  tw: number;
  tf: number;
  Fy: number;
  E: number;
  nu: number;
  Kx: number;
  Ky: number;
  Kz: number;
  Lx: number;
  Ly: number;
  Pu: number;
  Mux: number;
  Muy: number;
  h1: number;
  h2: number;
  b1: number;
  b2: number;
}

/**
 * Ported EXACTLY from `protected-source/auto-find-section.html`.
 *
 * This file is server-only by design.
 */

// 조합 3: Rolled H 단면의 표준 tw, tf, r 값 (KS 표준)
const rolledHStandardThickness: Record<number, { tw: number; tf: number; r: number }> = {
  400: { tw: 8, tf: 13, r: 16 },
  450: { tw: 9, tf: 14, r: 18 },
  500: { tw: 10, tf: 16, r: 20 },
  506: { tw: 11, tf: 19, r: 20 },
  482: { tw: 12, tf: 17, r: 28 },
  488: { tw: 12, tf: 20, r: 28 },
  582: { tw: 12, tf: 17, r: 28 },
  588: { tw: 12, tf: 20, r: 28 },
  600: { tw: 11, tf: 17, r: 22 },
};

// 세 가지 조합 정의
const combinations: SectionCombination[] = [
  { H1: 500, H2: 500, B1: 300, B2: 300, name: 'BH500×B300' },
  { H1: 450, H2: 450, B1: 250, B2: 250, name: 'BH450×B250' },
  // 조합 3: Rolled H 단면들
  { H1: 400, H2: 400, B1: 200, B2: 200, name: 'H400×B200' },
  { H1: 450, H2: 450, B1: 200, B2: 200, name: 'H450×B200' },
  { H1: 500, H2: 500, B1: 200, B2: 200, name: 'H500×B200' },
  { H1: 506, H2: 506, B1: 201, B2: 201, name: 'H506×B201' },
  { H1: 482, H2: 482, B1: 300, B2: 300, name: 'H482×B300' },
  { H1: 488, H2: 488, B1: 300, B2: 300, name: 'H488×B300' },
  { H1: 582, H2: 582, B1: 300, B2: 300, name: 'H582×B300' },
  { H1: 588, H2: 588, B1: 300, B2: 300, name: 'H588×B300' },
  { H1: 600, H2: 600, B1: 200, B2: 200, name: 'H600×B200' },
];

export async function getCombinations(): Promise<SectionCombination[]> {
  return combinations;
}

export async function getRolledHStandardThickness(): Promise<
  Record<number, { tw: number; tf: number; r: number }>
> {
  return rolledHStandardThickness;
}

function hasOwn(obj: object, key: string | number): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isCombination3(h1: number, b1: number): boolean {
  const hasStandardH = hasOwn(rolledHStandardThickness, h1);
  return (
    hasStandardH &&
    (b1 === 200 ||
      b1 === 201 ||
      (b1 === 300 && (h1 === 482 || h1 === 488 || h1 === 582 || h1 === 588)))
  );
}

/**
 * Port of `calculateSection()` from `protected-source/auto-find-section.html`.
 *
 * IMPORTANT:
 * - Keep formulas, constants, and control-flow identical.
 * - Units are assumed to already be normalized by the caller.
 */
export async function calculateSection(input: CrossHSectionCalcInput): Promise<CrossHSectionCalcResult> {
  const {
    thickness: { tw, tf },
    material: { Fy, E, nu },
    factors: { Kx, Ky, Kz },
    lengths: { Lx, Ly },
    loads: { Pu, Mux, Muy },
    dims: { h1, h2, b1, b2 },
  } = input;

  return calculateSectionByArgs({
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
    b2,
  });
}

/**
 * Original positional version for parity with HTML.
 */
export async function calculateSectionByInputs(
  tw: number,
  tf: number,
  Fy: number,
  E: number,
  nu: number,
  Kx: number,
  Ky: number,
  Kz: number,
  Lx: number,
  Ly: number,
  Pu: number,
  Mux: number,
  Muy: number,
  h1: number,
  h2: number,
  b1: number,
  b2: number
): Promise<CrossHSectionCalcResult> {
  return calculateSectionByArgs({
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
    b2,
  });
}

function calculateSectionByArgs(args: CalculateSectionArgs): CrossHSectionCalcResult {
  const { tw, tf, Fy, E, nu, Kx, Ky, Kz, Lx, Ly, Pu, Mux, Muy, h1, h2, b1, b2 } = args;

  // ===== 입력값 가져오기 (Main Calculator quickCalculate와 동일) =====
  const tw1 = tw;
  const tf1 = tf;
  const tw2 = tw;
  const tf2 = tf;

  // 조합 3 (Rolled H)인지 확인하여 r1, r2 값 결정
  const comb3 = isCombination3(h1, b1);
  let r1: number;
  let r2: number;
  if (comb3) {
    const standardThickness = rolledHStandardThickness[h1];
    r1 = standardThickness.r || 0;
    r2 = standardThickness.r || 0;
  } else {
    r1 = 0;
    r2 = 0;
  }

  // ===== HBeam Class calculations (계산서와 완전히 동일한 공식 사용) =====
  const hw3 = h1 - 2 * tf1;
  const hw6 = h2 - 2 * tf2;
  const d1 = h1 / 2 - tf1 / 2;
  const d4 = h2 / 2 - tf2 / 2;

  // Total section area - Cross H section
  const ag1 = b1 * tf1;
  const ag2 = b1 * tf1;
  const ag3 = hw3 * tw1;
  const ag4 = b2 * tf2;
  const ag5 = b2 * tf2;
  const ag6 = hw6 * tw2;
  const ag7 = 4 * (r1 * r1 - (Math.PI * r1 * r1) / 4);
  const ag8 = 4 * (r2 * r2 - (Math.PI * r2 * r2) / 4);
  const ag9 = tw1 * tw2;
  const area = ag1 + ag2 + ag3 + ag4 + ag5 + ag6 + ag7 + ag8 - ag9;

  // Second inertia moment X-axis
  const Ix1 = (1 / 12) * b1 * Math.pow(tf1, 3) + ag1 * Math.pow(d1, 2);
  const Ix2 = (1 / 12) * b1 * Math.pow(tf1, 3) + ag1 * Math.pow(d1, 2);
  const Ix3 = (1 / 12) * tw1 * Math.pow(hw3, 3);
  const Ix4 = (1 / 12) * tf2 * Math.pow(b2, 3);
  const Ix5 = (1 / 12) * tf2 * Math.pow(b2, 3);
  const Ix6 = (1 / 12) * hw6 * Math.pow(tw2, 3);
  const Ix = Ix1 + Ix2 + Ix3 + Ix4 + Ix5 + Ix6;

  // Second inertia moment Y-axis
  const Iy4 = (1 / 12) * b2 * Math.pow(tf2, 3) + ag4 * Math.pow(d4, 2);
  const Iy5 = (1 / 12) * b2 * Math.pow(tf2, 3) + ag4 * Math.pow(d4, 2);
  const Iy6 = (1 / 12) * tw2 * Math.pow(hw6, 3);
  const Iy1 = (1 / 12) * tf1 * Math.pow(b1, 3);
  const Iy2 = (1 / 12) * tf1 * Math.pow(b1, 3);
  const Iy3 = (1 / 12) * hw3 * Math.pow(tw2, 3);
  const Iy = Iy1 + Iy2 + Iy3 + Iy4 + Iy5 + Iy6;

  // Radius of gyration
  const ix = Math.sqrt(Ix / area);
  const iy = Math.sqrt(Iy / area);

  // Elastic section modulus
  const sx = Ix / (h1 / 2);
  const sy = Iy / (h2 / 2);

  // Plastic section modulus Zx
  const Zx1 = b1 * tf1 * d1;
  const Zx2 = b1 * tf1 * d1;
  const Zx3 = ((tw1 * hw3) / 2) * (hw3 / 4);
  const Zx4 = ((tw1 * hw3) / 2) * (hw3 / 4);
  const Zx5 = (b2 * b2 * tf2) / 2;
  const Zx6 = ((tw2 * hw6) / 8) * 2;
  const zx = Zx1 + Zx2 + Zx3 + Zx4 + Zx5 + Zx6;

  // Plastic section modulus Zy
  const Zy1 = b2 * tf2 * d4;
  const Zy2 = b2 * tf2 * d4;
  const Zy3 = ((tw2 * hw6) / 2) * (hw6 / 4);
  const Zy4 = ((tw2 * hw6) / 2) * (hw6 / 4);
  const Zy5 = (b1 * b1 * tf1) / 2;
  const Zy6 = ((tw1 * hw3) / 8) * 2;
  const zy = Zy1 + Zy2 + Zy3 + Zy4 + Zy5 + Zy6;

  // Torsional constant J
  const J1 = (2 * b1 * Math.pow(tf1, 3) + h1 * Math.pow(tw1, 3)) / 3;
  const J2 = (2 * b2 * Math.pow(tf2, 3) + h2 * Math.pow(tw2, 3)) / 3;
  const J = J1 + J2;

  // Warping constant Cw
  const cw = (Iy * Math.pow(h1 - tf1, 2)) / 4;

  // ===== Column Class calculations =====
  const lcfr = 0.56 * Math.sqrt(E / Fy);
  const lcf = b2 / (2 * tf2);
  const isSlenderFlange = lcf > lcfr;

  // Web slenderness ratio for Flexure
  const lwp = 3.76 * Math.sqrt(E / Fy);
  const lwr = 5.7 * Math.sqrt(E / Fy);
  const lw1 = (h1 - 2 * (tf1 + r1) - tw1) / (2 * tw1);
  const lw2 = (h2 - 2 * (tf2 + r2) - tw2) / (2 * tw2);

  const lfp = 0.38 * Math.sqrt(E / Fy);
  const lfr = 1.0 * Math.sqrt(E / Fy);
  const lf1 = b1 / (2 * tf1);
  const lf2 = b2 / (2 * tf2);

  // Web classification: Compact / Noncompact / Slender
  let web1Class: WebClass = 'Compact';
  let web2Class: WebClass = 'Compact';
  let isSlenderWeb = false;

  if (lw1 <= lwp) {
    web1Class = 'Compact';
  } else if (lw1 <= lwr) {
    web1Class = 'Noncompact';
  } else {
    web1Class = 'Slender';
    isSlenderWeb = true;
  }

  if (lw2 <= lwp) {
    web2Class = 'Compact';
  } else if (lw2 <= lwr) {
    web2Class = 'Noncompact';
  } else {
    web2Class = 'Slender';
    isSlenderWeb = true;
  }

  let flange1Class: WebClass = 'Compact';
  let flange2Class: WebClass = 'Compact';

  if (lf1 <= lfp) {
    flange1Class = 'Compact';
  } else if (lf1 <= lfr) {
    flange1Class = 'Noncompact';
  } else {
    flange1Class = 'Slender';
  }

  if (lf2 <= lfp) {
    flange2Class = 'Compact';
  } else if (lf2 <= lfr) {
    flange2Class = 'Noncompact';
  } else {
    flange2Class = 'Slender';
  }

  // Slenderness ratio
  const lambdaX = (Kx * Lx) / ix;
  const lambdaY = (Ky * Ly) / iy;
  const lambda = Math.max(lambdaX, lambdaY);

  // Flexural Buckling Stress Fe1
  const Fe1 = Math.pow(Math.PI, 2) * E / Math.pow(lambda, 2);

  // Torsional Buckling Stress Fe2
  const G = E / (2 * (1 + nu));
  const Fe2 = (Math.pow(Math.PI, 2) * E * cw / Math.pow(Kz * Lx, 2) + G * J) / (Ix + Iy);

  // Critical stress Fcr
  const Fe = Math.min(Fe1, Fe2);
  const Fcr = Math.pow(0.658, Fy / Fe) * Fy;

  // Compressive Strength phi_Pn
  const phi_c = 0.9;
  const phi_Pn = (phi_c * area * Fcr) / 1000;

  // Flexural Strength
  const Mpx = Math.min(Fy * zx, 1.6 * Fy * sx) / 1_000_000;
  const Mpy = Math.min(Fy * zy, 1.6 * Fy * sy) / 1_000_000;
  const phi_b = 0.9;
  const phi_Mnx = phi_b * Mpx;
  const phi_Mny = phi_b * Mpy;

  const As1 = hw3 * tw1 + 2 * tf1 * b1;
  const As2 = hw6 * tw2 + 2 * tf2 * b2;
  const Vny = (0.6 * Fy * As1) / 1000;
  const Vnx = (0.6 * Fy * As2) / 1000;
  const phi_Vny = Vny;
  const phi_Vnx = Vnx;

  // ===== 비율 계산 =====
  const ratio_comp = Pu / phi_Pn;
  const ratio_bendX = phi_Mnx > 0 ? Mux / phi_Mnx : 0;
  const ratio_bendY = phi_Mny > 0 ? Muy / phi_Mny : 0;
  const ratio_pmm =
    ratio_comp >= 0.2
      ? ratio_comp + (8 / 9) * (ratio_bendX + ratio_bendY)
      : ratio_comp / 2 + ratio_bendX + ratio_bendY;

  const isCompressiveNG = phi_Pn < Pu;

  return {
    phi_Pn,
    area,
    ratio_pmm,
    tw,
    tf,
    lcf,
    lcfr,
    isSlenderFlange,
    isCompressiveNG,
    lw1,
    lw2,
    lwp,
    lwr,
    web1Class,
    web2Class,
    isSlenderWeb,
    lfp,
    lfr,
    lf1,
    lf2,
    flange1Class,
    flange2Class,
    phi_Mnx,
    phi_Mny,
    phi_Vnx,
    phi_Vny,
  };
}
