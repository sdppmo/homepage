'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateCrossHColumn } from '@/actions/calculate';
import type { CrossHSectionCalcInput, CrossHSectionCalcResult } from '@/lib/calculations/cross-h-column';
import { createClient } from '@/lib/supabase/client';

// KS 표준 H형강 치수 데이터 (Roll H) - 사용 규격만
const ksHBeamData: Record<number, { B: number; tw: number; tf: number; r: number }> = {
  400: { B: 200, tw: 8, tf: 13, r: 16 },     // H400x200
  450: { B: 200, tw: 9, tf: 14, r: 18 },     // H450x200 (기본값)
  500: { B: 200, tw: 10, tf: 16, r: 20 },    // H500x200
  506: { B: 201, tw: 11, tf: 19, r: 20 },    // H506x201
  600: { B: 200, tw: 11, tf: 17, r: 22 },    // H600x200
  606: { B: 201, tw: 12, tf: 20, r: 22 },    // H606x201
  582: { B: 300, tw: 12, tf: 17, r: 28 },    // H582x300
  588: { B: 300, tw: 12, tf: 20, r: 28 },    // H588x300
  692: { B: 300, tw: 13, tf: 20, r: 28 },    // H692x300
  700: { B: 300, tw: 13, tf: 24, r: 28 },    // H700x300
  800: { B: 300, tw: 14, tf: 26, r: 28 },    // H800x300
  900: { B: 300, tw: 16, tf: 28, r: 28 },    // H900x300
  912: { B: 302, tw: 18, tf: 34, r: 28 },    // H912x302
};

const defaultValues = {
  H1: 500,
  B1: 200,
  tw1: 10,
  tf1: 16,
  r1: 20,
  H2: 500,
  B2: 200,
  tw2: 10,
  tf2: 16,
  r2: 20,
  steelGrade: 'SM355',
  Fy: 355,
  E: 205000,
  nu: 0.3,
  Lx: 4500,
  Ly: 4500,
  Lb: 4500,
  Kx: 0.8,
  Ky: 0.8,
  Kz: 0.8,
  Cb: 1.0,
  Pu: 5000,
  Mux: 200,
  Muy: 100,
  Vux: 0,
  Vuy: 0,
  projectName: 'K-COL',
};

export default function CrossHColumnCalculatorPage() {
  const [inputs, setInputs] = useState(defaultValues);
  const [result, setResult] = useState<CrossHSectionCalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'kcol' | 'posh'>('kcol');
  const [multiColumnData, setMultiColumnData] = useState<Array<{
    Pu: string;
    Mux: string;
    Muy: string;
    compressive: string;
    pmm: string;
  }>>(Array(6).fill({ Pu: '', Mux: '', Muy: '', compressive: '-', pmm: '-' }));
  const [hasAccessBeam, setHasAccessBeam] = useState(false);

  useEffect(() => {
    const checkAccessBeam = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('access_beam')
            .eq('id', user.id)
            .single();
          setHasAccessBeam(profile?.access_beam === true);
        }
      } catch {
        setHasAccessBeam(false);
      }
    };
    checkAccessBeam();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'H1') {
      const h1Value = parseInt(value);
      const data = ksHBeamData[h1Value];
      if (data) {
        setInputs((prev) => ({
          ...prev,
          H1: h1Value,
          B1: data.B,
          tw1: data.tw,
          tf1: data.tf,
          r1: activeType === 'posh' ? 0 : data.r,
        }));
        return;
      }
    }
    
    if (name === 'H2') {
      const h2Value = parseInt(value);
      const data = ksHBeamData[h2Value];
      if (data) {
        setInputs((prev) => ({
          ...prev,
          H2: h2Value,
          B2: data.B,
          tw2: data.tw,
          tf2: data.tf,
          r2: activeType === 'posh' ? 0 : data.r,
        }));
        return;
      }
    }
    
    setInputs((prev) => ({
      ...prev,
      [name]: name === 'steelGrade' || name === 'projectName' ? value : parseFloat(value) || 0,
    }));
  };

  const handleTypeChange = (type: 'kcol' | 'posh') => {
    setActiveType(type);
    if (type === 'posh') {
      setInputs((prev) => ({
        ...prev,
        r1: 0,
        r2: 0,
      }));
    } else {
      const data1 = ksHBeamData[inputs.H1];
      const data2 = ksHBeamData[inputs.H2];
      setInputs((prev) => ({
        ...prev,
        r1: data1?.r || 0,
        r2: data2?.r || 0,
      }));
    }
  };

  const handleMultiColumnChange = (index: number, field: 'Pu' | 'Mux' | 'Muy', value: string) => {
    setMultiColumnData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleMultiColumnCalculate = async () => {
    setLoading(true);
    try {
      const newData = await Promise.all(
        multiColumnData.map(async (row) => {
          const Pu = parseFloat(row.Pu) || 0;
          const Mux = parseFloat(row.Mux) || 0;
          const Muy = parseFloat(row.Muy) || 0;
          
          if (Pu === 0 && Mux === 0 && Muy === 0) {
            return { ...row, compressive: '-', pmm: '-' };
          }
          
          const calcInput: CrossHSectionCalcInput = {
            thickness: { tw: inputs.tw1, tf: inputs.tf1 },
            material: { Fy: inputs.Fy, E: inputs.E, nu: inputs.nu },
            factors: { Kx: inputs.Kx, Ky: inputs.Ky, Kz: inputs.Kz },
            lengths: { Lx: inputs.Lx, Ly: inputs.Ly },
            loads: { Pu, Mux, Muy },
            dims: { h1: inputs.H1, h2: inputs.H2, b1: inputs.B1, b2: inputs.B2 },
          };
          
          const calcResult = await calculateCrossHColumn(calcInput);
          const compressive = Pu / calcResult.phi_Pn;
          
          return {
            ...row,
            compressive: compressive.toFixed(3),
            pmm: calcResult.ratio_pmm.toFixed(3),
          };
        })
      );
      setMultiColumnData(newData);
    } catch (error) {
      console.error('Multi-column calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintNavigation = () => {
    if (!result) return;
    
    const printData = {
      H1: inputs.H1,
      B1: inputs.B1,
      tw1: inputs.tw1,
      tf1: inputs.tf1,
      r1: inputs.r1,
      H2: inputs.H2,
      B2: inputs.B2,
      tw2: inputs.tw2,
      tf2: inputs.tf2,
      r2: inputs.r2,
      steelGrade: inputs.steelGrade,
      Fy: inputs.Fy,
      E: inputs.E,
      nu: inputs.nu,
      Lx: inputs.Lx,
      Ly: inputs.Ly,
      Lb: inputs.Lb,
      Kx: inputs.Kx,
      Ky: inputs.Ky,
      Kz: inputs.Kz,
      Cb: inputs.Cb,
      Pu: inputs.Pu,
      Mux: inputs.Mux,
      Muy: inputs.Muy,
      Vux: inputs.Vux,
      Vuy: inputs.Vuy,
      name: inputs.projectName,
      results: result,
    };
    
    const dataParam = encodeURIComponent(JSON.stringify(printData));
    window.open(`/k-col/print?data=${dataParam}`, '_blank');
  };

  const copyMajorToMinor = () => {
    setInputs((prev) => ({
      ...prev,
      H2: prev.H1,
      B2: prev.B1,
      tw2: prev.tw1,
      tf2: prev.tf1,
      r2: prev.r1,
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const calcInput: CrossHSectionCalcInput = {
        thickness: { tw: inputs.tw1, tf: inputs.tf1 }, // Using H1 thickness for now as per original logic
        material: { Fy: inputs.Fy, E: inputs.E, nu: inputs.nu },
        factors: { Kx: inputs.Kx, Ky: inputs.Ky, Kz: inputs.Kz },
        lengths: { Lx: inputs.Lx, Ly: inputs.Ly },
        loads: { Pu: inputs.Pu, Mux: inputs.Mux, Muy: inputs.Muy },
        dims: { h1: inputs.H1, h2: inputs.H2, b1: inputs.B1, b2: inputs.B2 },
      };

      const calcResult = await calculateCrossHColumn(calcInput);
      setResult(calcResult);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined, decimals: number = 0) => {
    if (num === undefined || isNaN(num)) return '-';
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getStatusClass = (isNG: boolean | undefined) => {
    if (isNG === undefined) return 'bg-yellow-100 text-yellow-800';
    return isNG ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusText = (isNG: boolean | undefined) => {
    if (isNG === undefined) return '대기';
    return isNG ? 'NG' : 'OK';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-[5px] font-['Segoe_UI',_Arial,_sans-serif]">
      <div className="max-w-[1100px] mx-auto bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white p-[15px_25px] flex justify-between items-center">
          <div className="flex items-center gap-[15px]">
            <a
              href="/"
              className="text-white/80 no-underline text-[13px] px-[12px] py-[6px] border border-white/30 rounded transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              ← 홈으로
            </a>
            <h1 className="text-[20px] font-medium">SRC(Cross H) Design Calculator</h1>
          </div>
          <div className="flex gap-[8px]">
            <button
              className={`px-[20px] py-[8px] border-2 rounded-[20px] text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                activeType === 'kcol' 
                  ? 'bg-white text-[#1e3a5f] border-white' 
                  : 'bg-transparent text-white border-white/50 hover:bg-white hover:text-[#1e3a5f] hover:border-white'
              }`}
              onClick={() => handleTypeChange('kcol')}
            >
              Rolled H
            </button>
            <button
              className={`px-[20px] py-[8px] border-2 rounded-[20px] text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                activeType === 'posh' 
                  ? 'bg-white text-[#1e3a5f] border-white' 
                  : 'bg-transparent text-white border-white/50 hover:bg-white hover:text-[#1e3a5f] hover:border-white'
              }`}
              onClick={() => handleTypeChange('posh')}
            >
              Pos-H / Built-UP H
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[500px_1fr] gap-0">
          <div className="bg-[#f8fafc] p-[20px_20px_0_20px] border-r border-[#e2e8f0]">
            <div className="text-[14px] font-semibold text-[#1e3a5f] mb-[15px] flex items-center gap-[8px] before:content-[''] before:w-[4px] before:h-[16px] before:bg-[#667eea] before:rounded-[2px]">
              Section Dimensions
            </div>

            <div className="flex gap-[10px] mb-[15px] items-center">
              <label className="text-[12px] text-[#666] font-medium">NAME</label>
                <input
                  type="text"
                  name="projectName"
                  value={inputs.projectName}
                  onChange={handleInputChange}
                  className="flex-1 p-[8px_12px] border border-[#ddd] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#667eea]"
                />
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-lg p-[15px] mb-[15px] text-center relative">
              <div className="w-full h-[200px] flex items-center justify-center">
                <Image
                  src="/images/2H-section.png"
                  alt="Cross H Column Section"
                  width={200}
                  height={180}
                  className="object-contain"
                />
              </div>
              <div className="flex justify-center gap-[20px] mt-[10px] text-[11px]">
                <div className="flex items-center gap-[6px]">
                  <div className="w-[12px] h-[12px] border border-[#666] rounded-[2px] bg-[#22c55e] shrink-0"></div>
                  <span>Major (H1)</span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[12px] h-[12px] border border-[#666] rounded-[2px] bg-[#3b82f6] shrink-0"></div>
                  <span>Minor (H2)</span>
                </div>
              </div>
            </div>

            <button
              className="w-full p-[10px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md text-[12px] font-medium cursor-pointer mb-[15px] transition-transform duration-200 hover:-translate-y-[1px]"
              onClick={copyMajorToMinor}
            >
              Major ↔ Minor 단면 동일 적용
            </button>

            <div className="grid grid-cols-2 gap-[10px]">
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-[12px]">
                <h4 className="text-[12px] text-[#667eea] mb-[10px] text-center font-semibold">Major (H1)</h4>
                {[
                  { label: 'H1', name: 'H1', type: 'select', options: [400, 450, 500, 506, 600, 606, 582, 588, 692, 700, 800, 900, 912] },
                  { label: 'B1', name: 'B1' },
                  { label: 'tw1', name: 'tw1' },
                  { label: 'tf1', name: 'tf1' },
                  { label: 'r1', name: 'r1' },
                ].map((field) => (
                  <div key={field.name} className="flex justify-between items-center mb-[6px] text-[11px]">
                    <label className="text-[#666] font-medium">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[100px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-[11px] text-[#333] bg-white cursor-pointer focus:outline-none focus:border-[#667eea]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            H{opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[45px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea]"
                      />
                    )}
                    <span className="text-[10px] text-[#999] w-[20px]">mm</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-lg p-[12px]">
                <h4 className="text-[12px] text-[#667eea] mb-[10px] text-center font-semibold">Minor (H2)</h4>
                {[
                  { label: 'H2', name: 'H2', type: 'select', options: [400, 450, 500, 506, 600, 606, 582, 588, 692, 700, 800, 900, 912] },
                  { label: 'B2', name: 'B2' },
                  { label: 'tw2', name: 'tw2' },
                  { label: 'tf2', name: 'tf2' },
                  { label: 'r2', name: 'r2' },
                ].map((field) => (
                  <div key={field.name} className="flex justify-between items-center mb-[6px] text-[11px]">
                    <label className="text-[#666] font-medium">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[100px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-[11px] text-[#333] bg-white cursor-pointer focus:outline-none focus:border-[#667eea]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            H{opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[45px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea]"
                      />
                    )}
                    <span className="text-[10px] text-[#999] w-[20px]">mm</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-[8px] text-[14px] text-[#4a5568] text-center">
              단면적 : {result ? formatNumber(result.area) : '-'} mm² | 단중 : - kg/m
            </div>

            <div className="flex gap-[8px] mt-[15px] w-full">
              <button
                className="flex-1 p-[8px_14px] bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-lg text-[14px] font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] active:translate-y-0"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? '계산 중...' : '⚡ 간편계산(1-Column)'}
              </button>
            </div>

            {hasAccessBeam && (
            <div className="bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] border-2 border-[#f59e0b] rounded-lg p-[15px] mt-[15px] mb-[15px] shadow-[0_2px_8px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between gap-[8px] mb-[12px] pb-[8px] border-b-2 border-[#f59e0b]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px]">⚙️</span>
                  <h3 className="m-0 text-[16px] font-bold text-[#92400e]">운영자 Control</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-[8px] w-full">
                <button 
                  onClick={handlePrintNavigation}
                  disabled={!result}
                  className="w-full p-[12px] bg-[#6b7280] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#4b5563] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📄 전체계산서<br />(1-Column)
                </button>
                <Link 
                  href="/k-col/auto-find-section"
                  className="w-full p-[12px] bg-[#38a169] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2f855a] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] no-underline"
                >
                  A.F.S. Function<br />RH / BH
                </Link>
                <Link 
                  href="/k-col/calc-data-1"
                  className="w-full p-[12px] bg-[#1e3a5f] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2d5a87] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] no-underline"
                >
                  SRC<br />(Cross H)
                </Link>
                <Link 
                  href="/k-col/calc-data-2"
                  className="w-full p-[12px] bg-[#3b82f6] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2563eb] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] no-underline"
                >
                  A. D. C. Function<br />Top Down
                </Link>
              </div>
            </div>
            )}
          </div>

          <div className="p-[20px]">
            <div className="grid grid-cols-2 gap-[15px] mb-[20px]">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-[8px]">
                <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                  Steel Material
                </div>
                <div className="flex justify-between items-center mb-[4px]">
                  <label className="text-[12px] text-[#555]">Grade</label>
                  <select
                    name="steelGrade"
                    value={inputs.steelGrade}
                    onChange={handleInputChange}
                    className="p-[4px_6px] border border-[#ddd] rounded-[4px] text-[11px] text-[#333] bg-white"
                  >
                    <option>SS275</option>
                    <option>SS355</option>
                    <option>SM355</option>
                    <option>SM420</option>
                  </select>
                </div>
                {[
                  { label: 'Fy', name: 'Fy', unit: 'MPa' },
                  { label: 'E', name: 'E', unit: 'MPa' },
                  { label: 'ν', name: 'nu', unit: '' },
                ].map((field) => (
                  <div key={field.name} className="flex justify-between items-center mb-[4px]">
                    <label className="text-[12px] text-[#555]">{field.label}</label>
                    <div className="flex items-center gap-[5px]">
                      <input
                        type="text"
                        name={field.name}
                        value={inputs[field.name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                      />
                      <span className="text-[11px] text-[#888] min-w-[35px]">{field.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-[8px]">
                <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                  Effective Length Factor
                </div>
                <div className="grid grid-cols-3 gap-[10px]">
                  {['Kx', 'Ky', 'Kz'].map((name) => (
                    <div key={name} className="text-center">
                      <label className="block text-[11px] text-[#666] mb-[4px]">{name}</label>
                      <input
                        type="text"
                        name={name}
                        value={inputs[name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] text-[#333]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-[4px] mt-[12px]">
                  <label className="text-[12px] text-[#555] flex-1 whitespace-nowrap">Cb (Lateral Buckling)</label>
                  <div className="flex items-center gap-[5px] ml-auto">
                    <input
                      type="text"
                      name="Cb"
                      value={inputs.Cb}
                      onChange={handleInputChange}
                      className="w-[50px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-center text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-[8px]">
                <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                  Unbraced Length
                </div>
                {['Lx', 'Ly', 'Lb'].map((name) => (
                  <div key={name} className="flex justify-between items-center mb-[4px]">
                    <label className="text-[12px] text-[#555]">{name}</label>
                    <div className="flex items-center gap-[5px]">
                      <input
                        type="text"
                        name={name}
                        value={inputs[name as keyof typeof inputs]}
                        onChange={handleInputChange}
                        className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                      />
                      <span className="text-[11px] text-[#888] min-w-[35px]">m</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-[8px]">
                <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                  Design Load
                </div>
                <div className="flex justify-between items-center mb-[4px]">
                  <label className="text-[12px] text-[#555]">Pu (Axial)</label>
                  <div className="flex items-center gap-[5px]">
                    <input
                      type="text"
                      name="Pu"
                      value={inputs.Pu}
                      onChange={handleInputChange}
                      className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                    />
                    <span className="text-[11px] text-[#888] min-w-[35px]">kN</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[8px] mt-[8px]">
                  {[
                    { label: 'Mux', name: 'Mux', unit: 'kN·m' },
                    { label: 'Muy', name: 'Muy', unit: 'kN·m' },
                    { label: 'Vux', name: 'Vux', unit: 'kN' },
                    { label: 'Vuy', name: 'Vuy', unit: 'kN' },
                  ].map((field) => (
                    <div key={field.name} className="flex justify-between items-center mb-0">
                      <label className="text-[12px] text-[#555]">{field.label}</label>
                      <div className="flex items-center gap-[5px]">
                        <input
                          type="text"
                          name={field.name}
                          value={inputs[field.name as keyof typeof inputs]}
                          onChange={handleInputChange}
                          className="w-[60px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                        />
                        <span className="text-[11px] text-[#888] min-w-[35px]">{field.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8f4f8] border-2 border-[#667eea] rounded-lg p-[15px] mt-[15px]">
              <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                📊 1-Column Calculation Results
              </div>
              <div className="grid grid-cols-3 gap-[10px]">
                {[
                  { 
                    name: 'Compressive', 
                    value: result ? inputs.Pu / result.phi_Pn : undefined, 
                    check: 'Pu/φPn', 
                    isNG: result?.isCompressiveNG 
                  },
                  { 
                    name: 'Bending X', 
                    value: result && result.phi_Mnx > 0 ? inputs.Mux / result.phi_Mnx : undefined, 
                    check: 'Mux/φMnx', 
                    isNG: result && result.phi_Mnx > 0 ? inputs.Mux / result.phi_Mnx > 1.0 : undefined 
                  },
                  { 
                    name: 'Bending Y', 
                    value: result && result.phi_Mny > 0 ? inputs.Muy / result.phi_Mny : undefined, 
                    check: 'Muy/φMny', 
                    isNG: result && result.phi_Mny > 0 ? inputs.Muy / result.phi_Mny > 1.0 : undefined 
                  },
                  { 
                    name: 'P-M-M', 
                    value: result?.ratio_pmm, 
                    check: 'Combined', 
                    isNG: result ? result.ratio_pmm > 1.0 : undefined 
                  },
                  { 
                    name: 'Shear X', 
                    value: result && result.phi_Vnx > 0 ? inputs.Vux / result.phi_Vnx : undefined, 
                    check: 'Vux/φVnx', 
                    isNG: result && result.phi_Vnx > 0 ? inputs.Vux / result.phi_Vnx > 1.0 : undefined 
                  },
                  { 
                    name: 'Shear Y', 
                    value: result && result.phi_Vny > 0 ? inputs.Vuy / result.phi_Vny : undefined, 
                    check: 'Vuy/φVny', 
                    isNG: result && result.phi_Vny > 0 ? inputs.Vuy / result.phi_Vny > 1.0 : undefined 
                  },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-md p-[10px] border border-[#e2e8f0]">
                    <div className="text-[11px] font-semibold text-[#1e3a5f] mb-[5px]">{item.name}</div>
                    <div className="text-[10px] text-[#555] flex items-center gap-[5px]">
                      <span>{item.check} = </span>
                      <span className="font-semibold text-[#333]">{formatNumber(item.value, 3)}</span>
                      <span className={`px-[6px] py-[2px] rounded-[8px] text-[9px] font-medium ml-auto ${getStatusClass(item.isNG)}`}>
                        {getStatusText(item.isNG)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-[#e2e8f0] rounded-lg p-[12px] mt-[12px] shrink-0">
              <div className="text-[12px] font-semibold text-[#1e3a5f] mb-[6px] pb-[4px] border-b-2 border-[#667eea]">
                📋 Multi Column Calculation Sheet
              </div>
              <div className="overflow-x-auto overflow-y-visible mt-[8px] w-full">
                <table className="w-full border-collapse text-[11px] min-w-[500px] table-fixed">
                  <thead className="bg-[#f8fafc] sticky top-0 z-10">
                    <tr>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[10%]">Col. no</th>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[18%]">Pu</th>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[18%]">Mux</th>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[18%]">Muy</th>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[18%]">Compressive</th>
                      <th className="p-[8px_6px] text-center font-semibold text-[#1e3a5f] border border-[#e2e8f0] bg-[#f8fafc] text-[11px] w-[18%]">P-M-M</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiColumnData.map((row, index) => (
                      <tr key={index} className="hover:bg-[#f8fafc]">
                        <td className="p-[6px] text-center border border-[#e2e8f0] font-semibold text-[#1e3a5f] bg-[#f8fafc]">{index + 1}</td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]">
                          <input 
                            type="text" 
                            value={row.Pu}
                            onChange={(e) => handleMultiColumnChange(index, 'Pu', e.target.value)}
                            className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" 
                          />
                        </td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]">
                          <input 
                            type="text" 
                            value={row.Mux}
                            onChange={(e) => handleMultiColumnChange(index, 'Mux', e.target.value)}
                            className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" 
                          />
                        </td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]">
                          <input 
                            type="text" 
                            value={row.Muy}
                            onChange={(e) => handleMultiColumnChange(index, 'Muy', e.target.value)}
                            className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] text-[#333] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" 
                          />
                        </td>
                        <td className={`p-[6px] text-center border border-[#e2e8f0] font-medium ${
                          row.compressive !== '-' && parseFloat(row.compressive) > 1 ? 'text-red-500' : 'text-[#555]'
                        }`}>{row.compressive}</td>
                        <td className={`p-[6px] text-center border border-[#e2e8f0] font-medium ${
                          row.pmm !== '-' && parseFloat(row.pmm) > 1 ? 'text-red-500' : 'text-[#555]'
                        }`}>{row.pmm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center mt-[12px] pt-[12px] border-t border-[#e2e8f0]">
                <button 
                  onClick={handleMultiColumnCalculate}
                  disabled={loading}
                  className="w-full max-w-[400px] p-[12px_24px] border-none rounded-lg text-[14px] font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:bg-gradient-to-br hover:from-[#5568d3] hover:to-[#6b3fa0] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '계산 중...' : '⚡ Multi Column Execution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
