import Image from 'next/image';
import WorldClocks from '../widgets/WorldClocks';
import KosisPriceSection from '../widgets/KosisPriceSection';

interface MainContentProps {
  priceType: string | null;
  month: number | null;
  isPriceVisible: boolean;
}

const MainContent = ({ priceType, month, isPriceVisible }: MainContentProps) => {
  return (
    <div className="flex-1 relative flex flex-col md:order-2 md:min-h-[400px]">
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
    </div>
  );
};

export default MainContent;
