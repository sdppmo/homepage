import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Products Section - Modern gradient with glass effect */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">
              Supported Products
            </span>
            <div className="mt-1 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full" />
          </div>
          <div className="flex justify-center items-center gap-8 md:gap-12">
            {[
              { src: '/images/product-1.png', alt: 'K-COL' },
              { src: '/images/product-2.png', alt: 'SLiM-BOX' },
              { src: '/images/product-3.png', alt: 'ExSlim-Beam' },
              { src: '/images/product-4.png', alt: 'COL' },
            ].map((product) => (
              <div
                key={product.alt}
                className="group relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src={product.src}
                  alt={product.alt}
                  width={80}
                  height={80}
                  className="relative w-14 h-14 md:w-16 md:h-16 object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section - Subtle distinction */}
      <div className="bg-slate-800/80 py-5 border-t border-slate-700/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500 mr-2">
              Partners
            </span>
            {[
              { href: 'https://dystec.co.kr/new/', src: '/images/network-1.png', alt: 'DONG YANG S·Tec' },
              { href: 'https://www.posco.co.kr', src: '/images/network-2.png', alt: 'POSCO' },
              { href: 'https://www.steelall.co.kr', src: '/images/network-3.png', alt: 'Steel Ball' },
              { href: 'https://www.p6ix.co.kr', src: '/images/network-6.png', alt: 'p6sc' },
              { href: 'https://www.clbs.co.kr/main.jsp', src: '/images/network-5.png', alt: 'CLBS' },
              { href: 'https://www.hyundai-steel.com', src: '/images/network-4.jfif', alt: 'HYUNDAI STEEL' },
            ].map((partner) => (
              <a
                key={partner.alt}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 backdrop-blur-sm p-1.5 rounded-md hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={40}
                  height={24}
                  className="h-5 w-auto object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Company Info - Clean minimal */}
      <div className="bg-slate-900 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
              <span className="text-white font-medium">주식회사 송도파트너스피엠오</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span>대표: 김대근</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span>사업자등록번호: 899-87-01996</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
              <span>인천광역시 연수구 컨벤시아대로42번길 77, 903동 401호</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <a href="mailto:sbd_pmo@naver.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                sbd_pmo@naver.com
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} 주식회사 송도파트너스피엠오. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
