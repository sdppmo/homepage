import Image from 'next/image';
import WorldClocks from '../widgets/WorldClocks';
import KosisPriceSection from '../widgets/KosisPriceSection';
import PriceTable from '../widgets/PriceTable';

interface MainContentProps {
  priceType: string | null;
  month: number | null;
  isPriceVisible: boolean;
  onMonthSelect: (priceType: string, month: number) => void;
  kosisModeEnabled: boolean;
}

const MainContent = ({ priceType, month, isPriceVisible, onMonthSelect, kosisModeEnabled }: MainContentProps) => {
  return (
    <div className="flex-1 relative flex flex-col order-2 min-h-[400px] md:order-none md:min-h-0 md:pr-[300px] lg:pr-[250px]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/background_vessel_nyc.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col overflow-hidden pointer-events-none">
        <WorldClocks />

        <KosisPriceSection
          priceType={priceType}
          month={month}
          isVisible={isPriceVisible}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <PriceTable
          onMonthSelect={onMonthSelect}
          kosisModeEnabled={kosisModeEnabled}
        />
      </div>
    </div>
  );
};

export default MainContent;
