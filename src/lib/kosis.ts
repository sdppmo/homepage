export interface PriceTypeInfo {
  name: string;
  unit: string;
  orgId: string;
  tblId: string;
  itmId: string;
  keywords?: string[];
}

export const priceTypeInfo: Record<string, PriceTypeInfo> = {
  // 1) 건설공사비지수(2020=100)
  // https://kosis.kr/statHtml/statHtml.do?orgId=397&tblId=DT_39701_A003
  'construction': {
    name: '건설공사비지수 (2020=100)',
    unit: '지수',
    orgId: '397',
    tblId: 'DT_39701_A003',
    itmId: 'ALL'
  },
  // 기존 철강가격(원/톤) - 현재 사용 중인 표 유지
  'steel': {
    name: '철강 가격',
    unit: '원/톤',
    orgId: '101',
    tblId: 'DT_1ST1501',
    itmId: 'ALL'
  },
  // 2) 생산자물가지수(품목별) - 판재(지수): "중후판/열간압연강재" 등 키워드로 필터
  // https://kosis.kr/statHtml/statHtml.do?conn_path=I2&orgId=301&tblId=DT_404Y016
  'plate': {
    name: '판재가격(지수)',
    unit: '지수',
    orgId: '301',
    tblId: 'DT_404Y016',
    itmId: 'ALL',
    keywords: ['중후판', '열간압연강재', '열간압연']
  },
  // 3) 생산자물가지수(기본분류) - 철근(지수): "철근및봉강" 키워드로 필터
  // https://kosis.kr/statHtml/statHtml.do?conn_path=I2&orgId=301&tblId=DT_404Y014
  'rebar': {
    name: '철근가격(지수)',
    unit: '지수',
    orgId: '301',
    tblId: 'DT_404Y014',
    itmId: 'ALL',
    keywords: ['철근및봉강', '철근', '봉강']
  },
  // 4) 생산자물가지수(기본분류) - 레미콘(지수): "레미콘" 키워드로 필터
  // https://kosis.kr/statHtml/statHtml.do?conn_path=I2&orgId=301&tblId=DT_404Y014
  'concrete': {
    name: '레미콘가격(지수)',
    unit: '지수',
    orgId: '301',
    tblId: 'DT_404Y014',
    itmId: 'ALL',
    keywords: ['레미콘']
  }
};

export interface KosisItem {
  PRD_DE: string;
  DT: string;
  ITM_NM?: string;
  itmNm?: string;
  C1_NM?: string;
  C2_NM?: string;
  C3_NM?: string;
  C4_NM?: string;
  OBJ_NM?: string;
  objNm?: string;
}

export async function fetchKosisPriceData(priceType: string, month: number): Promise<KosisItem[]> {
  const info = priceTypeInfo[priceType];
  if (!info) {
    throw new Error(`Unknown price type: ${priceType}`);
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supaUrl || !anonKey) {
    console.warn('Supabase environment variables not set. Using default data.');
    return getDefaultPriceData(priceType, month);
  }

  const orgId = info.orgId || '101';
  const tblId = info.tblId;
  const itmId = info.itmId || 'ALL';

  try {
    const response = await fetch(`${supaUrl}/functions/v1/kosis-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        orgId,
        tblId,
        ...(itmId && itmId !== 'ALL' ? { itmId } : {}),
        prdSe: 'M',
        objL1: 'ALL',
        numOfRows: 24,
        format: 'json'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const items =
      (data && data.response && data.response.body && data.response.body.items) ?
        data.response.body.items :
      (Array.isArray(data) ? data : null);

    if (items && Array.isArray(items)) {
      let filtered = items;

      if (info.keywords && Array.isArray(info.keywords) && info.keywords.length > 0) {
        filtered = items.filter((it: KosisItem) => {
          const hay = [
            it.ITM_NM, it.itmNm,
            it.C1_NM, it.C2_NM, it.C3_NM, it.C4_NM,
            it.OBJ_NM, it.objNm,
          ].filter(Boolean).join(' ');
          return info.keywords!.some((kw) => hay.includes(kw));
        });

        if (!filtered || filtered.length === 0) filtered = items;
      }

      return filtered.slice().reverse();
    } else {
      console.error('KOSIS API response format is unexpected:', data);
      return getDefaultPriceData(priceType, month);
    }
  } catch (error) {
    console.error('Error fetching KOSIS data:', error);
    return getDefaultPriceData(priceType, month);
  }
}

function getDefaultPriceData(priceType: string, month: number): KosisItem[] {
  const defaultData: Record<string, Record<string, string>> = {
    'construction': { '12': '105.5', '1': '106.2' },
    'steel': { '12': '645,000', '1': '650,000' },
    'plate': { '12': '580,000', '1': '585,000' },
    'rebar': { '12': '720,000', '1': '725,000' },
    'concrete': { '12': '85,000', '1': '86,000' }
  };

  const currentYear = new Date().getFullYear();
  const targetMonth = month === 12 ? 12 : 1;
  const targetYear = month === 12 ? currentYear - 1 : currentYear;
  const dateStr = `${targetYear}${String(targetMonth).padStart(2, '0')}`;

  return [{
    PRD_DE: dateStr,
    DT: defaultData[priceType] ? defaultData[priceType][String(month)] : '-'
  }];
}
