'use client';

import ExchangeRate from './ExchangeRate';

interface PriceTableProps {
  onMonthSelect: (priceType: string, month: number) => void;
  kosisModeEnabled: boolean;
}

const PriceTable = ({ onMonthSelect, kosisModeEnabled }: PriceTableProps) => {
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priceType = e.target.getAttribute('data-price-type');
    const month = parseInt(e.target.value, 10);
    if (priceType && month) {
      onMonthSelect(priceType, month);
    }
  };

  const priceItems = [
    { type: 'construction', label: '건설지수' },
    { type: 'steel', label: '철강가격' },
    { type: 'plate', label: '판재가격' },
    { type: 'rebar', label: '철근가격' },
    { type: 'concrete', label: '레미콘가격' },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => (
    <option key={i + 1} value={i + 1}>{i + 1}월</option>
  ));

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl w-[220px] overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">환율 (₩/$)</span>
          <span className="text-sm font-semibold text-blue-400">
            <ExchangeRate />
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-700/30">
        {priceItems.map((item) => (
          <div
            key={item.type}
            className={`flex items-center justify-between px-3 py-2 transition-all duration-200 ${
              kosisModeEnabled
                ? 'bg-blue-600/10 hover:bg-blue-600/20 cursor-pointer'
                : 'hover:bg-slate-800/50'
            }`}
            title={kosisModeEnabled ? '클릭하여 월평균 가격 확인' : ''}
          >
            <span className={`text-xs font-medium ${kosisModeEnabled ? 'text-blue-300' : 'text-slate-400'}`}>
              {item.label}
            </span>
            <select
              className="w-16 px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-300 cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              data-price-type={item.type}
              onChange={handleMonthChange}
              defaultValue="12"
            >
              {monthOptions}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTable;
