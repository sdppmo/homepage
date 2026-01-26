'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { findOptimalSection } from '@/actions/calculate';
import type { OptimalSectionSearchInput, OptimalSectionSearchResult } from '@/lib/calculations/steel-section';

interface LoadData {
  no: number;
  name: string;
  pu: number;
  mux: number;
  muy: number;
}

interface CalculationResult {
  no: number;
  name: string;
  pu: number;
  pmm: number;
  grade: string;
  combination: string;
  h: number;
  b: number;
  tw: number;
  tf: number;
  area: number;
  weight: number;
  unitPrice: number;
  costPerMeter: number;
}

export default function AutoFindSectionPage() {
  const [columnCount, setColumnCount] = useState(3);
  const [kx, setKx] = useState(0.8);
  const [ky, setKy] = useState(0.8);
  const [kz, setKz] = useState(0.8);
  const [pmmLimit, setPmmLimit] = useState(1.0);
  const [lx, setLx] = useState(4.5);
  const [ly, setLy] = useState(4.5);
  const [lxType1, setLxType1] = useState(26.478);
  const [lxType2, setLxType2] = useState(23.678);
  const [lxType3, setLxType3] = useState(25.938);
  const [lxType4, setLxType4] = useState(22.438);
  const [twMin, setTwMin] = useState(8);
  const [twMax, setTwMax] = useState(16);
  const [tfMin, setTfMin] = useState(10);
  const [tfMax, setTfMax] = useState(20);

  const [loadData, setLoadData] = useState<LoadData[]>([]);

  const [results, setResults] = useState<CalculationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setLoadData((prevData) => {
      const newData: LoadData[] = [];
      for (let i = 1; i <= columnCount; i++) {
        const existing = prevData.find((d) => d.no === i);
        newData.push({
          no: i,
          name: existing?.name || `KC${i}`,
          pu: existing?.pu || 0,
          mux: existing?.mux || 0,
          muy: existing?.muy || 0,
        });
      }
      return newData;
    });
  }, [columnCount]);

  const handleLoadDataChange = (no: number, field: keyof LoadData, value: string | number) => {
    setLoadData((prevData) =>
      prevData.map((data) =>
        data.no === no ? { ...data, [field]: value } : data
      )
    );
  };

  const calculateAll = useCallback(async () => {
    setIsCalculating(true);
    setResults([]);

    const newResults: CalculationResult[] = [];

    for (const load of loadData) {
      if (load.pu === 0 && load.mux === 0 && load.muy === 0) continue;

      let bestResult: CalculationResult | null = null;
      let minCost = Infinity;

      const combinations = [
        { h1: 500, h2: 500, b1: 300, b2: 300, name: 'BH500×B300' },
        { h1: 450, h2: 450, b1: 250, b2: 250, name: 'BH450×B250' },
      ];

      const materials = [
        { name: 'SM420', fy: 420, unitPrice: 1900000 },
        { name: 'SM355', fy: 355, unitPrice: 1830000 },
      ];

      for (const combo of combinations) {
        for (const material of materials) {
          const input: OptimalSectionSearchInput = {
            loads: { Pu: load.pu, Mux: load.mux, Muy: load.muy },
            material: { Fy: material.fy, E: 205000, nu: 0.3 },
            factors: { Kx: kx, Ky: ky, Kz: kz },
            lengths: { Lx: lx * 1000, Ly: ly * 1000 },
            dims: { h1: combo.h1, h2: combo.h2, b1: combo.b1, b2: combo.b2 },
            pmmLimit: pmmLimit,
            twMin: twMin,
            twMax: twMax,
            tfMin: tfMin,
            tfMax: tfMax,
          };

          try {
            const result = await findOptimalSection(input);

            if (result.tw !== null && result.tf !== null) {
              const weight = result.area * 7.85 / 1000;
              const cost = weight * material.unitPrice / 1000;

              if (cost < minCost) {
                minCost = cost;
                bestResult = {
                  no: load.no,
                  name: load.name,
                  pu: load.pu,
                  pmm: result.ratioPMM,
                  grade: material.name,
                  combination: combo.name,
                  h: combo.h1,
                  b: combo.b1,
                  tw: result.tw,
                  tf: result.tf,
                  area: result.area,
                  weight: weight,
                  unitPrice: material.unitPrice,
                  costPerMeter: cost,
                };
              }
            }
          } catch (error) {
            console.error('Calculation error:', error);
          }
        }
      }

      if (bestResult) {
        newResults.push(bestResult);
      }
    }

    setResults(newResults);
    setIsCalculating(false);
  }, [loadData, kx, ky, kz, pmmLimit, lx, ly, twMin, twMax, tfMin, tfMax]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5 font-['Segoe_UI',Arial,sans-serif]">
      <div className="mx-auto max-w-[1800px] overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] px-[30px] py-5 text-white">
          <h1 className="text-2xl font-semibold">
            Auto Find Section : Cross H 기둥 자동구조계산 및 철골기둥 BOQ 산출
          </h1>
          <Link
            href="/k-col/calculator"
            className="rounded border border-white/30 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            ← 계산기로 돌아가기
          </Link>
        </div>

        <div className="p-[30px]">
          <div className="mb-5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <div className="mb-[15px] border-b-2 border-[#667eea] pb-[10px] text-lg font-semibold text-[#1e3a5f]">
              공통 설정
            </div>
            <div className="mb-[15px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px]">
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  기둥 개수
                </label>
                <input
                  type="number"
                  value={columnCount}
                  onChange={(e) => setColumnCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Kx
                </label>
                <input
                  type="number"
                  value={kx}
                  onChange={(e) => setKx(parseFloat(e.target.value) || 0.1)}
                  step="0.1"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Ky
                </label>
                <input
                  type="number"
                  value={ky}
                  onChange={(e) => setKy(parseFloat(e.target.value) || 0.1)}
                  step="0.1"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Kz
                </label>
                <input
                  type="number"
                  value={kz}
                  onChange={(e) => setKz(parseFloat(e.target.value) || 0.1)}
                  step="0.1"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
            </div>
            <div className="mt-[10px] border-t border-[#e2e8f0] pt-[15px]">
              <div className="flex max-w-[200px] flex-col">
                <label className="mb-[5px] text-xs font-semibold text-[#2c4a7c]">
                  P-M-M Limit
                </label>
                <input
                  type="number"
                  value={pmmLimit}
                  onChange={(e) => setPmmLimit(parseFloat(e.target.value) || 0.1)}
                  step="0.01"
                  min="0.1"
                  max="2.0"
                  className="w-full rounded border-2 border-[#2c4a7c] px-2 py-2 text-[13px] font-semibold focus:outline-none"
                  title="P-M-M 허용 최대값입니다. 이 값 이하인 단면을 찾습니다. 예: 0.9로 설정하면 0.9 이하의 단면을 찾습니다."
                />
                <div className="mt-1 text-[11px] text-[#666]">
                  P-M-M 최대 허용값 (≤ 이 값인 단면 선택)
                </div>
              </div>
            </div>
            <div className="mt-[15px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px]">
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Lx (m)
                </label>
                <input
                  type="number"
                  value={lx}
                  onChange={(e) => setLx(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Ly (m)
                </label>
                <input
                  type="number"
                  value={ly}
                  onChange={(e) => setLy(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
            </div>
            <div className="mt-[15px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px]">
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Type1 길이 (m)
                </label>
                <input
                  type="number"
                  value={lxType1}
                  onChange={(e) => setLxType1(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Type2 길이 (m)
                </label>
                <input
                  type="number"
                  value={lxType2}
                  onChange={(e) => setLxType2(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Type3 길이 (m)
                </label>
                <input
                  type="number"
                  value={lxType3}
                  onChange={(e) => setLxType3(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  Type4 길이 (m)
                </label>
                <input
                  type="number"
                  value={lxType4}
                  onChange={(e) => setLxType4(parseFloat(e.target.value) || 0.1)}
                  step="0.001"
                  min="0.1"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
            </div>
            <div className="mt-[15px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[15px]">
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  tw 최소 두께 (mm)
                </label>
                <input
                  type="number"
                  value={twMin}
                  onChange={(e) => setTwMin(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  max="50"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  tw 최대 두께 (mm)
                </label>
                <input
                  type="number"
                  value={twMax}
                  onChange={(e) => setTwMax(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  max="50"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  tf 최소 두께 (mm)
                </label>
                <input
                  type="number"
                  value={tfMin}
                  onChange={(e) => setTfMin(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  max="50"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-[5px] text-xs font-medium text-[#666]">
                  tf 최대 두께 (mm)
                </label>
                <input
                  type="number"
                  value={tfMax}
                  onChange={(e) => setTfMax(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  max="50"
                  className="rounded border border-[#cbd5e0] px-3 py-2 text-sm focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/10"
                />
              </div>
            </div>
            <div className="mt-[15px] rounded bg-[#e8f4f8] p-[10px] text-xs">
              <strong>고정 치수:</strong> 세 가지 조합을 계산하여 단가를 반영한
              가장 경제적인 단면을 선택합니다.
              <br />• 조합 1: BH1=500, BH2=500, B1=300, B2=300 (SM420, SM355)
              <br />• 조합 2: BH1=450, BH2=450, B1=250, B2=250 (SM420, SM355)
              <br />• 조합 3: H400, H450, H500, H506, H482, H488, H582, H588,
              H600 (Rolled H, SM355만)
              <br />• 강종: SM420 (1,900,000원/톤), SM355 (1,830,000원/톤) -
              단가 반영하여 비교
              <br />• tw1=tw2 (<span>{twMin}~{twMax}</span>mm), tf1=tf2 (<span>{tfMin}~{tfMax}</span>mm)
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <div className="mb-[15px] flex items-center justify-between border-b-2 border-[#667eea] pb-[10px]">
              <span className="text-lg font-semibold text-[#1e3a5f]">
                하중 입력
              </span>
              <div className="flex gap-2">
                <button className="cursor-pointer rounded bg-[#38a169] px-3 py-1.5 text-[13px] text-white">
                  📥 엑셀 다운로드
                </button>
                <label className="inline-block cursor-pointer rounded bg-[#667eea] px-3 py-1.5 text-[13px] text-white">
                  📤 하중 엑셀 업로드
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                />
              </div>
            </div>
            <table className="mt-[15px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-[#e2e8f0] bg-[#1e3a5f] p-[10px] text-xs font-semibold text-white">
                    No.
                  </th>
                  <th className="border border-[#e2e8f0] bg-[#1e3a5f] p-[10px] text-xs font-semibold text-white">
                    기둥 이름
                  </th>
                  <th className="border border-[#e2e8f0] bg-[#1e3a5f] p-[10px] text-xs font-semibold text-white">
                    Pu (kN)
                  </th>
                  <th className="border border-[#e2e8f0] bg-[#1e3a5f] p-[10px] text-xs font-semibold text-white">
                    Mux (kN·m)
                  </th>
                  <th className="border border-[#e2e8f0] bg-[#1e3a5f] p-[10px] text-xs font-semibold text-white">
                    Muy (kN·m)
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadData.map((data) => (
                  <tr key={data.no} className="hover:bg-[#e8f4f8] even:bg-[#f8fafc]">
                    <td className="border border-[#e2e8f0] p-[10px] text-center font-semibold text-[#667eea]">
                      {data.no}
                    </td>
                    <td className="border border-[#e2e8f0] p-[10px] text-center">
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) =>
                          handleLoadDataChange(data.no, 'name', e.target.value)
                        }
                        placeholder="기둥 이름"
                        className="w-full rounded border border-[#cbd5e0] p-1.5 text-[13px]"
                      />
                    </td>
                    <td className="border border-[#e2e8f0] p-[10px] text-center">
                      <input
                        type="number"
                        value={data.pu}
                        onChange={(e) =>
                          handleLoadDataChange(data.no, 'pu', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        placeholder="Pu"
                        className="w-full rounded border border-[#cbd5e0] p-1.5 text-[13px]"
                      />
                    </td>
                    <td className="border border-[#e2e8f0] p-[10px] text-center">
                      <input
                        type="number"
                        value={data.mux}
                        onChange={(e) =>
                          handleLoadDataChange(data.no, 'mux', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        placeholder="Mux"
                        className="w-full rounded border border-[#cbd5e0] p-1.5 text-[13px]"
                      />
                    </td>
                    <td className="border border-[#e2e8f0] p-[10px] text-center">
                      <input
                        type="number"
                        value={data.muy}
                        onChange={(e) =>
                          handleLoadDataChange(data.no, 'muy', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        placeholder="Muy"
                        className="w-full rounded border border-[#cbd5e0] p-1.5 text-[13px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <div className="mb-[15px] border-b-2 border-[#667eea] pb-[10px] text-lg font-semibold text-[#1e3a5f]">
              계산 및 결과
            </div>
            <div className="mb-5 flex gap-[10px]">
              <button
                onClick={calculateAll}
                disabled={isCalculating}
                className="flex-1 cursor-pointer rounded-md bg-gradient-to-r from-[#667eea] to-[#764ba2] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] disabled:opacity-50"
              >
                {isCalculating ? '계산 중...' : 'Auto Find Section Result'}
              </button>
              <button className="flex-1 cursor-pointer rounded-md bg-[#667eea] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5568d3]">
                📄 계산서 출력
              </button>
              <button className="flex-1 cursor-pointer rounded-md bg-[#667eea] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5568d3]">
                📥 결과 다운로드 (Excel)
              </button>
              <button className="flex-1 cursor-pointer rounded-md bg-[#38a169] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2f855a]">
                📋 BOQ 산출
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="mt-5 w-full border-collapse bg-white text-[9px]">
                <thead>
                  <tr>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      No.
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      기둥명
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      Pu (kN)
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      P-M-M
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      강종
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      조합
                    </th>
                    <th colSpan={6} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      규격
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      단면적<br />(mm²)
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      단중<br />(kg/m)
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      단가<br />(원/톤)
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      단위길이당<br />금액(원/m)
                    </th>
                    <th rowSpan={2} className="sticky top-0 z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      계산서
                    </th>
                  </tr>
                  <tr>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      K
                    </th>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      L
                    </th>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      H
                    </th>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      B
                    </th>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      tw
                    </th>
                    <th className="sticky top-[29px] z-10 whitespace-nowrap border border-[#ccc] bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] p-[5px_6px] text-[9px] font-semibold text-white">
                      tf
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.no} className="hover:bg-[#e8f4f8] even:bg-[#f8fafc]">
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.no}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.name}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.pu.toFixed(1)}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.pmm.toFixed(3)}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.grade}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.combination}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        -
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        -
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.h}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.b}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.tw}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.tf}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.area.toFixed(0)}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.weight.toFixed(1)}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.unitPrice.toLocaleString()}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        {result.costPerMeter.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="border border-[#ccc] p-[4px_6px] text-center align-middle text-[9px] text-[#333]">
                        <button className="cursor-pointer rounded bg-[#667eea] px-2 py-1 text-white hover:bg-[#5568d3]">
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
