import Image from 'next/image';
import Link from 'next/link';

export default function TwoHSteelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] font-['Malgun_Gothic','Segoe_UI',Arial,sans-serif] text-[#333]">
      <div className="max-w-[1600px] mx-auto p-5">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] text-white p-5 pl-[140px] rounded-xl mb-5 flex justify-between items-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative">
          <Link href="/" className="absolute top-5 left-5 px-5 py-2.5 bg-white/20 text-white border-2 border-white/30 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 no-underline inline-flex items-center gap-2 z-10 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <span>🏠</span>
            <span>홈으로</span>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              🏗️ K-COLUMN 공정관리 시스템 <span className="ml-2.5 text-xs font-extrabold bg-white/18 px-2.5 py-1.5 rounded-full">PROJECT</span>
            </h1>
            <p className="mt-1.5 opacity-90">K-COLUMN 50EA 제작 및 설치 공정</p>
          </div>
          <div className="text-right text-sm">
            <div>공사기간: 2025.12.26 ~ 2026.04.30</div>
            <div className="mt-1.5">총 기둥수: <strong>50개</strong></div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="bg-white rounded-xl p-5 mb-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 mb-4">
            <button className="px-6 py-3 bg-[#2c4a7c] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 m-0">✏️ 일일 입력</button>
            <p className="m-0 text-[#666] text-sm">아래 데이터(1~6) 입력을 위해 "일일입력"을 먼저 클릭하고 해당공정으로 들어가시기 바랍니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              1. 주기둥커팅
              <small className="block font-normal mt-1.5 opacity-90">유석철강(충주공장)</small>
            </button>
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#ff9800] to-[#f57c00] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              2. 소부재가공
              <small className="block font-normal mt-1.5 opacity-90">유석철강(오창공장)</small>
            </button>
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#2196f3] to-[#1976d2] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              3. 주기둥조립
              <small className="block font-normal mt-1.5 opacity-90">유석철강(음성공장)</small>
            </button>
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#00bcd4] to-[#0097a7] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              4. 소부재조립
              <small className="block font-normal mt-1.5 opacity-90">유석철강(음성공장)</small>
            </button>
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#9c27b0] to-[#7b1fa2] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              5. 현장배송
              <small className="block font-normal mt-1.5 opacity-90">유석철강(음성공장)</small>
            </button>
            <button className="px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br from-[#4caf50] to-[#388e3c] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
              6. 현장설치
              <small className="block font-normal mt-1.5 opacity-90">진흥기업</small>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2.5 mb-5">
          <button className="px-6 py-3 bg-[#2c4a7c] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300">📊 전체 현황</button>
          <button className="px-6 py-3 bg-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 text-[#666] hover:bg-[#f0f0f0]">🚚 운송차수계획</button>
          <button className="px-6 py-3 bg-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 text-[#666] hover:bg-[#f0f0f0]">📅 공정표 (Gantt)</button>
          <button className="px-6 py-3 bg-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 text-[#666] hover:bg-[#f0f0f0]">📈 진행률 차트</button>
          <button className="px-6 py-3 bg-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 text-[#666] hover:bg-[#f0f0f0]">📦 운송물량산정</button>
          <button className="px-6 py-3 bg-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 text-[#666] hover:bg-[#f0f0f0]">🏗️ 현장설치현황도</button>
        </div>

        {/* Overview Panel */}
        <div className="block bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[#2c4a7c] text-lg font-bold">📊 전체 공정 현황</h3>
            <button className="px-4 py-2 bg-[#f44336] text-white border-none rounded-md cursor-pointer font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
              🔄 전체 초기화
            </button>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>1. 주기둥커팅</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#e74c3c]">유석철강(충주공장)</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#e74c3c] to-[#c0392b]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>2. 소부재가공</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#e74c3c]">유석철강(오창공장)</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#ff9800] to-[#f57c00]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>3. 주기둥조립</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#e74c3c]">유석철강(음성공장)</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#2196f3] to-[#1976d2]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>4. 소부재조립</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#e74c3c]">유석철강(음성공장)</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#00bcd4] to-[#0097a7]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>5. 현장배송</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#e74c3c]">유석철강(음성공장)</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#9c27b0] to-[#7b1fa2]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                <span>6. 현장설치</span>
                <span className="px-2.5 py-1 rounded-md text-xs text-white bg-[#27ae60]">진흥기업</span>
              </h4>
              <div className="mb-2.5">
                <div className="flex justify-between mb-1.5 text-sm">
                  <span>완료</span>
                  <span>0 / 50</span>
                </div>
                <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                  <div className="h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r from-[#4caf50] to-[#388e3c]" style={{ width: '0%' }}>0%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column Status Grid */}
          <h3 className="my-5 text-[#2c4a7c] text-lg font-bold">🔩 기둥별 현재 공정 상태</h3>
          <div className="flex gap-4 flex-wrap mb-5 p-4 bg-[#f8f9fa] rounded-lg">
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#f8f9fa]"></div><span>미착수</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#ffebee]"></div><span>1.주기둥커팅</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#fff3e0]"></div><span>2.소부재가공</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#e3f2fd]"></div><span>3.주기둥조립</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#e0f7fa]"></div><span>4.소부재조립</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#fff5ff]"></div><span>5.현장배송</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#4caf50]"></div><span>6.설치완료</span></div>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-5">
            {/* Generated by JS - Placeholder for now */}
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="relative aspect-square border-2 border-[#ddd] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-[#f8f9fa] text-xs hover:border-[#2c4a7c] hover:scale-105 hover:z-10">
                <span className="font-bold text-sm text-[#333]">C-{i + 1}</span>
                <span className="text-[10px] text-[#666] mt-0.5">미착수</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
