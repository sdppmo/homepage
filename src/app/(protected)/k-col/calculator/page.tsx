'use client';

import React, { useState, useEffect } from 'react';
import { calculateCrossHColumn } from '@/actions/calculate';
import type { CrossHSectionCalcInput, CrossHSectionCalcResult } from '@/lib/calculations/cross-h-column';

const defaultValues = {
  H1: 500,
  B1: 300,
  tw1: 12,
  tf1: 16,
  r1: 18,
  H2: 500,
  B2: 300,
  tw2: 12,
  tf2: 16,
  r2: 18,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === 'steelGrade' || name === 'projectName' ? value : parseFloat(value) || 0,
    }));
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
              className={`px-[20px] py-[8px] border-2 border-white/50 bg-transparent text-white rounded-[20px] text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                activeType === 'kcol' ? 'bg-white text-[#1e3a5f] border-white' : 'hover:bg-white hover:text-[#1e3a5f] hover:border-white'
              }`}
              onClick={() => setActiveType('kcol')}
            >
              Rolled H
            </button>
            <button
              className={`px-[20px] py-[8px] border-2 border-white/50 bg-transparent text-white rounded-[20px] text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                activeType === 'posh' ? 'bg-white text-[#1e3a5f] border-white' : 'hover:bg-white hover:text-[#1e3a5f] hover:border-white'
              }`}
              onClick={() => setActiveType('posh')}
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
                className="flex-1 p-[8px_12px] border border-[#ddd] rounded text-[13px] focus:outline-none focus:border-[#667eea]"
              />
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-lg p-[15px] mb-[15px] text-center relative">
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500">
                Cross H Column Section Image
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
                        className="w-[100px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-[11px] bg-white cursor-pointer focus:outline-none focus:border-[#667eea]"
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
                        className="w-[45px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-right text-[11px] focus:outline-none focus:border-[#667eea]"
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
                        className="w-[100px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-[11px] bg-white cursor-pointer focus:outline-none focus:border-[#667eea]"
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
                        className="w-[45px] p-[4px_6px] border border-[#ddd] rounded-[3px] text-right text-[11px] focus:outline-none focus:border-[#667eea]"
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

            <div className="bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] border-2 border-[#f59e0b] rounded-lg p-[15px] mt-[15px] mb-[15px] shadow-[0_2px_8px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between gap-[8px] mb-[12px] pb-[8px] border-b-2 border-[#f59e0b]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px]">⚙️</span>
                  <h3 className="m-0 text-[16px] font-bold text-[#92400e]">운영자 Control</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-[8px] w-full">
                <button className="w-full p-[12px] bg-[#6b7280] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#4b5563] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                  📄 전체계산서<br />(1-Column)
                </button>
                <button className="w-full p-[12px] bg-[#38a169] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2f855a] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                  A.F.S. Function<br />RH / BH
                </button>
                <button className="w-full p-[12px] bg-[#1e3a5f] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2d5a87] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                  SRC<br />(Cross H)
                </button>
                <button className="w-full p-[12px] bg-[#3b82f6] text-white border-none rounded-md text-[13px] cursor-pointer transition-all duration-200 text-center whitespace-normal leading-[1.4] font-semibold flex flex-col items-center justify-center hover:bg-[#2563eb] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                  A. D. C. Function<br />Top Down
                </button>
              </div>
            </div>
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
                    className="p-[4px_6px] border border-[#ddd] rounded-[4px] text-[11px] bg-white"
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
                        className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
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
                        className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px]"
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
                      className="w-[50px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-center text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
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
                        className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
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
                      className="w-[80px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
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
                          className="w-[60px] p-[4px_6px] border border-[#ddd] rounded-[4px] text-right text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
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
                  { name: 'Compressive', value: result?.phi_Pn, check: 'Pu/φPn', isNG: result?.isCompressiveNG },
                  { name: 'Bending X', value: undefined, check: 'Mux/φMnx', isNG: undefined },
                  { name: 'Bending Y', value: undefined, check: 'Muy/φMny', isNG: undefined },
                  { name: 'P-M-M', value: result?.ratio_pmm, check: 'Combined', isNG: result ? result.ratio_pmm > 1.0 : undefined },
                  { name: 'Shear X', value: undefined, check: 'Vux/φVnx', isNG: undefined },
                  { name: 'Shear Y', value: undefined, check: 'Vuy/φVny', isNG: undefined },
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
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                      <tr key={row} className="hover:bg-[#f8fafc]">
                        <td className="p-[6px] text-center border border-[#e2e8f0] font-semibold text-[#1e3a5f] bg-[#f8fafc]">{row}</td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]"><input type="text" className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" /></td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]"><input type="text" className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" /></td>
                        <td className="p-[6px] text-center border border-[#e2e8f0]"><input type="text" className="w-full p-[4px] border border-[#ddd] rounded-[4px] text-center text-[11px] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_2px_rgba(102,126,234,0.1)]" /></td>
                        <td className="p-[6px] text-center border border-[#e2e8f0] font-medium text-[#555]">-</td>
                        <td className="p-[6px] text-center border border-[#e2e8f0] font-medium text-[#555]">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center mt-[12px] pt-[12px] border-t border-[#e2e8f0]">
                <button className="w-full max-w-[400px] p-[12px_24px] border-none rounded-lg text-[14px] font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:bg-gradient-to-br hover:from-[#5568d3] hover:to-[#6b3fa0] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0">
                  ⚡ Multi Column Execution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
