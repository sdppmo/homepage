import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] border-t-4 border-[#333] w-full">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          {/* Company Information - Left side */}
          <div className="text-[#999] text-xs leading-relaxed space-y-1 md:flex-1">
            <p className="text-white font-semibold text-sm mb-2">주식회사 송도파트너스피엠오</p>
            <p><span className="text-[#666]">대표자:</span> 김대근</p>
            <p><span className="text-[#666]">사업자등록번호:</span> 899-87-01996</p>
            <p><span className="text-[#666]">주소:</span> 인천광역시 연수구 컨벤시아대로42번길 77, 903동 401호(송도동, 더샵 엑스포)</p>
            <p><span className="text-[#666]">이메일:</span> <a href="mailto:sbd_pmo@naver.com" className="text-[#6af] hover:underline">sbd_pmo@naver.com</a></p>
          </div>

          {/* Product Logos - Center on mobile, middle on desktop */}
          <div className="flex justify-center items-center gap-4 md:gap-6 py-2">
            <Image
              src="/images/product-1.png"
              alt="K-COL"
              width={60}
              height={60}
              className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
            <Image
              src="/images/product-2.png"
              alt="SLiM-BOX"
              width={60}
              height={60}
              className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
            <Image
              src="/images/product-3.png"
              alt="ExSlim-Beam"
              width={60}
              height={60}
              className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
            <Image
              src="/images/product-4.png"
              alt="COL"
              width={60}
              height={60}
              className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>

          {/* Partners - Right side, compact inline on desktop */}
          <div className="hidden md:flex md:flex-col md:items-end md:flex-shrink-0">
            <p className="text-[#555] text-[10px] mb-2 uppercase tracking-wider">Partners</p>
            <div className="flex gap-1.5">
              <a href="https://dystec.co.kr/new/" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-1.png" alt="DONG YANG S·Tec" width={32} height={20} className="max-h-full object-contain" />
              </a>
              <a href="https://www.posco.co.kr" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-2.png" alt="POSCO" width={32} height={20} className="max-h-full object-contain" />
              </a>
              <a href="https://www.steelall.co.kr" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-3.png" alt="Steel Ball" width={32} height={20} className="max-h-full object-contain" />
              </a>
              <a href="https://www.p6ix.co.kr" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-6.png" alt="p6sc" width={32} height={20} className="max-h-full object-contain" />
              </a>
              <a href="https://www.clbs.co.kr/main.jsp" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-5.png" alt="CLBS" width={32} height={20} className="max-h-full object-contain" />
              </a>
              <a href="https://www.hyundai-steel.com" target="_blank" rel="noopener noreferrer" className="bg-white/90 p-1 rounded flex items-center justify-center w-10 h-7 hover:bg-white transition-colors">
                <Image src="/images/network-4.jfif" alt="HYUNDAI STEEL" width={32} height={20} className="max-h-full object-contain" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#333] mt-6 pt-4 text-center">
          <p className="text-[#555] text-[10px]">
            © {new Date().getFullYear()} 주식회사 송도파트너스피엠오. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
