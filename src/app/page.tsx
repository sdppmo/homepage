"use client";

import { useState } from 'react';
import LeftSidebar from '@/components/layout/LeftSidebar';
import MainContent from '@/components/layout/MainContent';
import RightSidebar from '@/components/layout/RightSidebar';
import Footer from '@/components/layout/Footer';

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
    <div className="page-wrapper flex flex-col w-screen min-h-screen m-0 overflow-visible md:h-screen md:overflow-hidden">
      <div className="top-row flex flex-col flex-1 overflow-visible relative md:flex-row md:overflow-hidden">
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
      <div className="bottom-row flex flex-col flex-shrink-0 h-auto w-full md:flex-row md:h-[100px]">
        <Footer />
      </div>
    </div>
  );
}
