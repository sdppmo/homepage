import ExchangeRate from '../widgets/ExchangeRate';

interface RightSidebarProps {
  onMonthSelect: (priceType: string, month: number) => void;
  kosisModeEnabled: boolean;
}

const RightSidebar = ({ onMonthSelect, kosisModeEnabled }: RightSidebarProps) => {
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priceType = e.target.getAttribute('data-price-type');
    const month = parseInt(e.target.value, 10);
    if (priceType && month) {
      onMonthSelect(priceType, month);
    }
  };

  const priceRowClass = kosisModeEnabled
    ? "p-1.5 text-xs text-[#333] border-r border-[#ddd] flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-[#f0f4ff] bg-[#f0f4ff] border-2 border-[#667eea] font-semibold xs:p-1 xs:text-[10px]"
    : "p-1.5 text-xs text-[#333] border-r border-[#ddd] flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-[#f0f4ff] xs:p-1 xs:text-[10px]";

  return (
    <aside className="absolute top-0 right-0 bottom-0 w-[300px] p-4 z-20 overflow-y-auto overflow-x-hidden pointer-events-auto lg:w-[250px] lg:p-2.5 md:relative md:w-full md:p-4 md:bg-black/80">
      <div className="news-section mt-5 lg:mt-[100px] md:mt-5">
        <div className="text-3xl font-bold text-white text-center mb-4 drop-shadow-[2px_2px_4px_#000] lg:text-2xl xs:text-xl">
          NEWS
        </div>
        <div className="bg-black/70 border border-[rgba(255,215,0,0.5)] p-3.5 mb-2.5 text-lg italic text-[#ffd700] leading-normal text-center lg:text-sm lg:p-2.5 xs:text-[13px] xs:p-2.5">
          K-COL Steel Column<br />Program is release on<br />1 of Dec.<br />New Auto Find Section<br />to be loaded on<br />1 of Feb.
        </div>
        <div className="bg-black/70 border border-[rgba(255,215,0,0.5)] p-3.5 mb-2.5 text-lg italic text-[#ffd700] leading-normal text-center lg:text-sm lg:p-2.5 xs:text-[13px] xs:p-2.5">
          Slimbox tests on 1 of Jan<br />with posco Global R&D<br />Center at Songdo, Incheon
        </div>
        <div className="bg-black/70 border border-[rgba(255,215,0,0.5)] p-3.5 mb-2.5 text-lg italic text-[#ffd700] leading-normal text-center lg:text-sm lg:p-2.5 xs:text-[13px] xs:p-2.5">
          H beam price up<br />50won/kg on Nov. from<br />Hyundai-steel
        </div>
        <div className="bg-black/70 border border-[rgba(255,215,0,0.5)] p-3.5 mb-2.5 text-lg italic text-[#ffd700] leading-normal text-center lg:text-sm lg:p-2.5 xs:text-[13px] xs:p-2.5">
          K-COL<br />실시공 현장 OPEN
        </div>
      </div>

      <div className="exchange-table absolute bottom-0 left-5 z-[9999] pointer-events-auto bg-white/90 border-2 border-[#666] mb-4 md:relative md:bottom-auto md:left-auto md:mb-0 md:mt-4 xs:text-[11px]">
        <div className="bg-gradient-to-b from-[#666] to-[#555] text-white p-1.5 text-xs font-bold">
          환율(won/$): <ExchangeRate />
        </div>
        <div className="grid grid-cols-2 border-b border-[#ddd]">
          <div className={priceRowClass} title={kosisModeEnabled ? "클릭하여 월평균 가격 확인" : ""}>
            <span className="flex-shrink-0 font-medium">건설지수</span>
            <select className="flex-1 p-1 text-[11px] border border-[#999] rounded bg-white text-[#333] cursor-pointer min-w-[60px] hover:border-[#667eea] hover:bg-[#f0f4ff] focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[rgba(102,126,234,0.2)]" data-price-type="construction" onChange={handleMonthChange} defaultValue="12">
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-[#ddd]">
          <div className={priceRowClass} title={kosisModeEnabled ? "클릭하여 월평균 가격 확인" : "KOSIS (국가통계포털)에서 받아봅니다."}>
            <span className="flex-shrink-0 font-medium">철강가격</span>
            <select className="flex-1 p-1 text-[11px] border border-[#999] rounded bg-white text-[#333] cursor-pointer min-w-[60px] hover:border-[#667eea] hover:bg-[#f0f4ff] focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[rgba(102,126,234,0.2)]" data-price-type="steel" onChange={handleMonthChange} defaultValue="12">
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-[#ddd]">
          <div className={priceRowClass} title={kosisModeEnabled ? "클릭하여 월평균 가격 확인" : ""}>
            <span className="flex-shrink-0 font-medium">판재가격</span>
            <select className="flex-1 p-1 text-[11px] border border-[#999] rounded bg-white text-[#333] cursor-pointer min-w-[60px] hover:border-[#667eea] hover:bg-[#f0f4ff] focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[rgba(102,126,234,0.2)]" data-price-type="plate" onChange={handleMonthChange} defaultValue="12">
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-[#ddd]">
          <div className={priceRowClass} title={kosisModeEnabled ? "클릭하여 월평균 가격 확인" : ""}>
            <span className="flex-shrink-0 font-medium">철근가격</span>
            <select className="flex-1 p-1 text-[11px] border border-[#999] rounded bg-white text-[#333] cursor-pointer min-w-[60px] hover:border-[#667eea] hover:bg-[#f0f4ff] focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[rgba(102,126,234,0.2)]" data-price-type="rebar" onChange={handleMonthChange} defaultValue="12">
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className={priceRowClass} title={kosisModeEnabled ? "클릭하여 월평균 가격 확인" : ""}>
            <span className="flex-shrink-0 font-medium">레미콘가격</span>
            <select className="flex-1 p-1 text-[11px] border border-[#999] rounded bg-white text-[#333] cursor-pointer min-w-[60px] hover:border-[#667eea] hover:bg-[#f0f4ff] focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[rgba(102,126,234,0.2)]" data-price-type="concrete" onChange={handleMonthChange} defaultValue="12">
              <option value="1">1월</option>
              <option value="2">2월</option>
              <option value="3">3월</option>
              <option value="4">4월</option>
              <option value="5">5월</option>
              <option value="6">6월</option>
              <option value="7">7월</option>
              <option value="8">8월</option>
              <option value="9">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
