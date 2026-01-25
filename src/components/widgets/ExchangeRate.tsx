"use client";

import { useState, useEffect } from 'react';

const ExchangeRate = () => {
  const [rate, setRate] = useState<string>('1,350원');
  const [title, setTitle] = useState<string>('로딩중...');

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // 1) Dunamu (빠르고 정확, 하지만 CSP/connect-src가 허용되어야 함)
        try {
          const response = await fetch('https://quotation-api.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (!response.ok) throw new Error(`Dunamu HTTP ${response.status}`);
          const data = await response.json();
          if (data && data.length > 0 && data[0].basePrice) {
            const rateValue = data[0].basePrice;
            setRate(Math.round(rateValue).toLocaleString() + '원');
            setTitle('업데이트: ' + new Date().toLocaleString('ko-KR') + ' (USD/KRW)');
            return;
          }
          throw new Error('Dunamu data missing');
        } catch (e) {
          // fallthrough to open.er-api.com
          console.warn('Dunamu API failed, falling back...', e);
        }

        // 2) Fallback: open.er-api.com (CORS friendly)
        try {
          const fallback = await fetch('https://open.er-api.com/v6/latest/USD', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (!fallback.ok) throw new Error(`Fallback HTTP ${fallback.status}`);
          const fx = await fallback.json();
          const rateValue = fx && fx.rates && fx.rates.KRW ? fx.rates.KRW : null;
          if (!rateValue) throw new Error('Fallback data missing');
          setRate(Math.round(rateValue).toLocaleString() + '원');
          setTitle('업데이트: ' + new Date().toLocaleString('ko-KR') + ' (USD/KRW, fallback)');
        } catch (e) {
          console.warn('Fallback API failed, using default value...', e);
          throw e;
        }
      } catch (error) {
        console.error('환율 정보를 가져오는 중 오류 발생:', error);
        // 오류 발생 시 기본 메시지 표시 (하드코딩된 값)
        setRate('1,350원');
        setTitle('환율 정보를 가져올 수 없습니다. (기본값)');
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 3600000); // 1시간마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return (
    <span id="exchange-rate" title={title} className="font-bold text-[#ffcc00]">
      {rate}
    </span>
  );
};

export default ExchangeRate;
