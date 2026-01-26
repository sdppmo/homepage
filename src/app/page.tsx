"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LeftSidebar from '@/components/layout/LeftSidebar';
import Footer from '@/components/layout/Footer';

const MainContent = dynamic(() => import('@/components/layout/MainContent'), {
  ssr: true,
  loading: () => (
    <div className="flex-1 relative flex flex-col order-2 min-h-[400px] md:order-none md:min-h-0 md:pr-[300px] lg:pr-[250px] bg-gray-800 animate-pulse" />
  ),
});

const RightSidebar = dynamic(() => import('@/components/layout/RightSidebar'), {
  ssr: true,
  loading: () => (
    <aside className="relative w-full p-4 z-20 bg-black/80 order-3 md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[300px] md:order-none lg:w-[250px] animate-pulse" />
  ),
});

export default function Home() {
  const [kosisModeEnabled, setKosisModeEnabled] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isPriceVisible, setIsPriceVisible] = useState(false);

  const handleKosisClick = () => {
    setKosisModeEnabled(!kosisModeEnabled);
    if (kosisModeEnabled) {
      setIsPriceVisible(false);
      alert('KOSIS 모드가 비활성화되었습니다.');
    } else {
      alert('✅ KOSIS 모드가 활성화되었습니다!\n\n📊 사용 방법:\n1. 아래 가격 항목(건설지수, 철강가격, 판재가격 등)을 클릭하세요\n2. 클릭한 항목의 월평균 가격이 표시됩니다\n3. 다시 클릭하면 KOSIS 모드를 비활성화할 수 있습니다');
    }
  };

  const handleMonthSelect = (priceType: string, month: number) => {
    if (!kosisModeEnabled) {
      alert('⚠️ KOSIS 모드가 활성화되지 않았습니다.\n\n먼저 왼쪽 메뉴에서 "KOSIS (월평균가격)"을 클릭하여 모드를 활성화해주세요.');
      return;
    }
    setSelectedPriceType(priceType);
    setSelectedMonth(month);
    setIsPriceVisible(true);
  };

  return (
    <div className="page-wrapper flex flex-col w-screen min-h-screen m-0 overflow-auto">
      <div className="top-row flex flex-col flex-1 overflow-visible relative md:flex-row md:min-h-[calc(100vh-200px)]">
        <LeftSidebar
          onKosisClick={handleKosisClick}
          kosisModeEnabled={kosisModeEnabled}
        />
        <MainContent
          priceType={selectedPriceType}
          month={selectedMonth}
          isPriceVisible={isPriceVisible}
        />
        <RightSidebar
          onMonthSelect={handleMonthSelect}
          kosisModeEnabled={kosisModeEnabled}
        />
      </div>
      <div className="bottom-row flex-shrink-0 w-full">
        <Footer />
      </div>
    </div>
  );
}
