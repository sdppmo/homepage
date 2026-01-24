import Image from 'next/image';
import Link from 'next/link';

interface LeftSidebarProps {
  onKosisClick: () => void;
  kosisModeEnabled: boolean;
}

const LeftSidebar = ({ onKosisClick, kosisModeEnabled }: LeftSidebarProps) => {
  return (
    <aside className="w-[360px] flex flex-col flex-shrink-0 bg-[#d0d0d0] relative z-10 md:w-full md:order-1">
      <div className="bg-gradient-to-b from-[#e8e8e8] to-[#c8c8c8] p-2 border-b-2 border-[#999] sm:p-1.5">
        <div className="flex justify-center">
          <Image
            src="/images/sdppmo_logo.png"
            alt="SongDoPartners"
            width={336}
            height={68}
            className="h-[68px] w-auto mix-blend-multiply sm:h-[50px] xs:h-[40px]"
            priority
          />
        </div>
        <div className="text-center text-black text-base font-bold my-1.5 sm:text-sm xs:text-xs">
          Welcome to SongDoPartners !!
        </div>
      </div>

      <nav className="flex flex-col bg-[#1a1a3a] flex-1">
        <Link
          href="/consulting"
          className="nav-item gold"
        >
          Consulting
        </Link>
        <Link
          href="/products"
          className="nav-item gold"
        >
          Products
        </Link>
        <Link
          href="/slim-box-web-support"
          className="nav-item gold"
        >
          D. M. I. S. (K-COL / Slim-Box)
        </Link>
        <Link
          href="/k-col-web-software"
          className="nav-item active gold"
        >
          K-COL Web Software
        </Link>
        <Link
          href="/k-product-schedule"
          className="nav-item gold"
        >
          K-COL Product Schedule
        </Link>
        <div className="nav-item small-text gray-text">
          EX-Slim-Box(Not in Service)
        </div>
        <Link
          href="/ks-code-database"
          className="nav-item gold"
        >
          KS code DB(철골용)
        </Link>
        <Link
          href="/qa"
          className="nav-item gold"
        >
          Q & A (logged-in user)
        </Link>
        <div
          className={`nav-item cursor-pointer ${kosisModeEnabled ? 'bg-[#667eea] text-white' : 'gray-text'}`}
          onClick={onKosisClick}
          title={kosisModeEnabled ? 'KOSIS 모드 활성화됨 - 가격 항목을 클릭하세요' : 'KOSIS 모드 비활성화됨'}
        >
          KOSIS (월평균가격)
        </div>
      </nav>

      <div className="grid grid-cols-2 bg-[#1a2050] flex-shrink-0 border-l-8 border-[#ff6600] sm:grid-cols-2 xs:border-l-[5px]">
        <Link
          href="/k-col-web-software/k-col-user-guide#kcol-guide-header"
          className="brochure-btn"
        >
          K-COL Brochure
        </Link>
        <a
          href="/pdf/hyundai-steel-h-beam.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="brochure-btn"
        >
          현대제철 H형강
        </a>
        <button className="brochure-btn gray-text">
          SLim-Box Brochure
        </button>
        <a
          href="/pdf/Pos-H Brochure step4.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="brochure-btn white"
        >
          POS H 형강
        </a>
        <button className="brochure-btn gray-text">
          Ex_Slim-Beam Brochure
        </button>
        <button className="brochure-btn yellow">
          Sunex MTL
        </button>
      </div>
    </aside>
  );
};

export default LeftSidebar;
