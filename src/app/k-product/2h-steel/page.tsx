'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'overview' | 'transport' | 'gantt' | 'progress' | 'quantity' | 'installation';

export default function TwoHSteelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleComingSoon = (feature: string) => {
    showToast(`"${feature}" 기능은 준비 중입니다.`);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '전체 현황', icon: '📊' },
    { id: 'transport', label: '운송차수계획', icon: '🚚' },
    { id: 'gantt', label: '공정표 (Gantt)', icon: '📅' },
    { id: 'progress', label: '진행률 차트', icon: '📈' },
    { id: 'quantity', label: '운송물량산정', icon: '📦' },
    { id: 'installation', label: '현장설치현황도', icon: '🏗️' },
  ];

  const processSteps = [
    { num: 1, name: '주기둥커팅', company: '유석철강(충주공장)', colors: 'from-[#e74c3c] to-[#c0392b]', bgColor: '#ffebee' },
    { num: 2, name: '소부재가공', company: '유석철강(오창공장)', colors: 'from-[#ff9800] to-[#f57c00]', bgColor: '#fff3e0' },
    { num: 3, name: '주기둥조립', company: '유석철강(음성공장)', colors: 'from-[#2196f3] to-[#1976d2]', bgColor: '#e3f2fd' },
    { num: 4, name: '소부재조립', company: '유석철강(음성공장)', colors: 'from-[#00bcd4] to-[#0097a7]', bgColor: '#e0f7fa' },
    { num: 5, name: '현장배송', company: '유석철강(음성공장)', colors: 'from-[#9c27b0] to-[#7b1fa2]', bgColor: '#fff5ff' },
    { num: 6, name: '현장설치', company: '진흥기업', colors: 'from-[#4caf50] to-[#388e3c]', bgColor: '#e8f5e9' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] font-['Malgun_Gothic','Segoe_UI',Arial,sans-serif] text-[#333]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#333] text-white rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto p-5">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2c4a7c] to-[#4a6fa5] text-white p-5 pl-[140px] rounded-xl mb-5 flex justify-between items-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative">
          <Link href="/" className="absolute top-5 left-5 px-5 py-2.5 bg-white/20 text-white border-2 border-white/30 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 no-underline inline-flex items-center gap-2 z-10 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <span>🏠</span>
            <span>홈으로</span>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">
              🏗️ K-COLUMN 공정관리 시스템 <span className="ml-2.5 text-xs font-extrabold bg-white/18 px-2.5 py-1.5 rounded-full">DEMO</span>
            </h1>
            <p className="mt-1.5 opacity-90">K-COLUMN 50EA 제작 및 설치 공정 (데모 화면)</p>
          </div>
          <div className="text-right text-sm">
            <div>공사기간: 2025.12.26 ~ 2026.04.30</div>
            <div className="mt-1.5">총 기둥수: <strong>50개</strong></div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="bg-white rounded-xl p-5 mb-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => handleComingSoon('일일 입력')}
              className="px-6 py-3 bg-[#2c4a7c] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 m-0 hover:bg-[#1e3a5f]"
            >
              ✏️ 일일 입력
            </button>
            <p className="m-0 text-[#666] text-sm">아래 데이터(1~6) 입력을 위해 &quot;일일입력&quot;을 먼저 클릭하고 해당공정으로 들어가시기 바랍니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            {processSteps.map((step) => (
              <button
                key={step.num}
                onClick={() => handleComingSoon(step.name)}
                className={`px-7 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex-1 min-w-[200px] bg-gradient-to-br ${step.colors} text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]`}
              >
                {step.num}. {step.name}
                <small className="block font-normal mt-1.5 opacity-90">{step.company}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#2c4a7c] text-white'
                  : 'bg-white text-[#666] hover:bg-[#f0f0f0]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="block bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-[#2c4a7c] text-lg font-bold">📊 전체 공정 현황</h3>
              <button 
                onClick={() => handleComingSoon('전체 초기화')}
                className="px-4 py-2 bg-[#f44336] text-white border-none rounded-md cursor-pointer font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
              >
                🔄 전체 초기화
              </button>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {processSteps.map((step) => (
                <div key={step.num} className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                  <h4 className="mb-4 text-[#333] flex items-center gap-2.5 font-bold">
                    <span>{step.num}. {step.name}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs text-white bg-gradient-to-br ${step.colors}`}>{step.company}</span>
                  </h4>
                  <div className="mb-2.5">
                    <div className="flex justify-between mb-1.5 text-sm">
                      <span>완료</span>
                      <span>0 / 50</span>
                    </div>
                    <div className="h-6 bg-[#e0e0e0] rounded-xl overflow-hidden">
                      <div className={`h-full rounded-xl transition-all duration-500 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-r ${step.colors}`} style={{ width: '0%' }}>0%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column Status Grid */}
            <h3 className="my-5 text-[#2c4a7c] text-lg font-bold">🔩 기둥별 현재 공정 상태</h3>
            <div className="flex gap-4 flex-wrap mb-5 p-4 bg-[#f8f9fa] rounded-lg">
              <div className="flex items-center gap-2 text-sm"><div className="w-5 h-5 rounded border border-[#ccc] bg-[#f8f9fa]"></div><span>미착수</span></div>
              {processSteps.map((step) => (
                <div key={step.num} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded border border-[#ccc]" style={{ backgroundColor: step.bgColor }}></div>
                  <span>{step.num}.{step.name}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-5">
              {Array.from({ length: 50 }, (_, i) => (
                <div 
                  key={i} 
                  onClick={() => handleComingSoon(`기둥 C-${i + 1} 상세`)}
                  className="relative aspect-square border-2 border-[#ddd] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-[#f8f9fa] text-xs hover:border-[#2c4a7c] hover:scale-105 hover:z-10"
                >
                  <span className="font-bold text-sm text-[#333]">C-{i + 1}</span>
                  <span className="text-[10px] text-[#666] mt-0.5">미착수</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-[#2c4a7c] mb-2">운송차수계획</h3>
            <p className="text-[#666]">운송 일정 및 차수별 계획을 관리하는 기능입니다.</p>
            <p className="text-sm text-[#999] mt-4">이 기능은 현재 개발 중입니다.</p>
          </div>
        )}

        {activeTab === 'gantt' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-[#2c4a7c] mb-2">공정표 (Gantt Chart)</h3>
            <p className="text-[#666]">전체 공정 일정을 간트 차트로 시각화합니다.</p>
            <p className="text-sm text-[#999] mt-4">이 기능은 현재 개발 중입니다.</p>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-[#2c4a7c] mb-2">진행률 차트</h3>
            <p className="text-[#666]">공정별 진행률을 차트로 확인합니다.</p>
            <p className="text-sm text-[#999] mt-4">이 기능은 현재 개발 중입니다.</p>
          </div>
        )}

        {activeTab === 'quantity' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-[#2c4a7c] mb-2">운송물량산정</h3>
            <p className="text-[#666]">운송에 필요한 물량을 산정합니다.</p>
            <p className="text-sm text-[#999] mt-4">이 기능은 현재 개발 중입니다.</p>
          </div>
        )}

        {activeTab === 'installation' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-[#2c4a7c] mb-2">현장설치현황도</h3>
            <p className="text-[#666]">현장 설치 현황을 시각적으로 확인합니다.</p>
            <p className="text-sm text-[#999] mt-4">이 기능은 현재 개발 중입니다.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
