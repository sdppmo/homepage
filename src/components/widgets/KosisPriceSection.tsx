"use client";

import { useState, useEffect } from 'react';
import { fetchKosisPriceData, KosisItem, priceTypeInfo } from '@/lib/kosis';

interface KosisPriceSectionProps {
  priceType: string | null;
  month: number | null;
  isVisible: boolean;
}

const KosisPriceSection = ({ priceType, month, isVisible }: KosisPriceSectionProps) => {
  const [data, setData] = useState<KosisItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible && priceType && month) {
      setLoading(true);
      fetchKosisPriceData(priceType, month)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [isVisible, priceType, month]);

  if (!isVisible || !priceType || !month) {
    return null;
  }

  const info = priceTypeInfo[priceType];

  return (
    <section className="price-section absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 p-5 rounded-lg shadow-lg z-30 max-w-[90%] w-[400px] text-center md:w-[90%] md:p-4 xs:p-2.5">
      <h2 className="text-2xl font-bold text-[#333] mb-2.5 md:text-xl xs:text-lg">
        월간 {info.name}
      </h2>
      <p className="text-sm text-[#666] mb-4 md:text-xs xs:text-[11px]">
        단위: {info.unit}
      </p>

      {loading ? (
        <p>로딩중...</p>
      ) : (
        <table className="w-full border-collapse mb-4 md:text-sm xs:text-xs">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="p-2.5 border border-[#ddd] font-bold text-[#333] md:p-2 xs:p-1.5">월</th>
              <th className="p-2.5 border border-[#ddd] font-bold text-[#333] md:p-2 xs:p-1.5">평균 가격</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const dateStr = item.PRD_DE || '';
              const formattedDate = dateStr.length === 6
                ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}`
                : dateStr;

              const raw = item.DT;
              const num = raw !== undefined && raw !== null ? Number(raw) : NaN;
              let formattedPrice = '-';
              if (!Number.isNaN(num)) {
                const isInt = Number.isInteger(num);
                formattedPrice = num.toLocaleString(undefined, {
                  maximumFractionDigits: isInt ? 0 : 2,
                });
              } else {
                formattedPrice = raw ? String(raw) : '-';
              }

              return (
                <tr key={index}>
                  <td className="p-2.5 border border-[#ddd] text-[#333] md:p-2 xs:p-1.5">{formattedDate}</td>
                  <td className="p-2.5 border border-[#ddd] text-[#333] md:p-2 xs:p-1.5">{formattedPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <small className="block text-xs text-[#999] leading-normal md:text-[11px] xs:text-[10px]">
        ※ 본 가격 정보는 공공 통계 기반의 월 평균 참고값이며,<br />
        실제 거래 가격은 조건에 따라 달라질 수 있습니다.<br />
        출처: <a href="https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1ST1501&vw_cd=MT_ZTITLE&list_id=101_10101_001&seqNo=&lang_mode=ko&language=kor&obj_var_id=&itm_id=&conn_path=MT_ZTITLE" target="_blank" className="text-[#667eea] underline">KOSIS (국가통계포털)</a>
      </small>
    </section>
  );
};

export default KosisPriceSection;
