import Image from 'next/image';

const Footer = () => {
  return (
    <div className="flex flex-shrink-0 h-[100px] md:flex-col md:h-auto">
      <div className="w-[360px] bg-[#d0d0d0] p-0 flex justify-evenly items-center border-t-4 border-[#333] flex-shrink-0 md:w-full md:p-2.5 md:h-auto">
        <Image
          src="/images/product-1.png"
          alt="K-COL"
          width={90}
          height={90}
          className="w-1/4 h-auto object-contain mix-blend-multiply scale-100 translate-x-5 contrast-[1.3] saturate-[1.5] md:w-[22%] md:transform-none"
        />
        <Image
          src="/images/product-2.png"
          alt="SLiM-BOX"
          width={90}
          height={90}
          className="w-1/4 h-auto object-contain mix-blend-multiply scale-75 contrast-[1.3] saturate-[1.5] md:w-[22%] md:transform-none"
        />
        <Image
          src="/images/product-3.png"
          alt="ExSlim-Beam"
          width={90}
          height={90}
          className="w-1/4 h-auto object-contain mix-blend-multiply scale-115 contrast-[1.3] saturate-[1.5] md:w-[22%] md:transform-none"
        />
        <Image
          src="/images/product-4.png"
          alt="COL"
          width={90}
          height={90}
          className="w-1/4 h-auto object-contain mix-blend-multiply scale-85 translate-y-1 contrast-[1.3] saturate-[1.5] md:w-[22%] md:transform-none"
        />
      </div>

      <footer className="flex-1 bg-[#1a1a1a] flex items-center justify-between p-2 gap-3 z-20 relative border-t-4 border-[#333] h-full overflow-hidden min-w-0 md:flex-col md:h-auto md:p-4 md:gap-2.5 md:items-stretch">
        <div className="flex-1 min-w-0 text-[11px] text-[#ccc] leading-[1.3] overflow-hidden md:order-1 md:text-center md:whitespace-normal md:overflow-visible md:mb-1.5 lg:text-[10px] xs:text-[11px]">
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full md:whitespace-normal md:overflow-visible">
            Homepage : http://www.kcol.kr
          </div>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full md:whitespace-normal md:overflow-visible">
            E-Mail Address : If any problems, contact me : <a href="mailto:sbd_pmo@naver.com" className="text-[#6af] no-underline hover:underline">sbd_pmo@naver.com</a>
          </div>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full md:whitespace-normal md:overflow-visible">
            HQ. Address : 77-bungi, 42-bungil, Conventia Daero, Yeonsu-ku, Incheon, KOREA
          </div>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full md:whitespace-normal md:overflow-visible">
            Seoul Office Address : TBD
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#ffd700] to-[#cc9900] border-2 border-[#996600] p-1.5 text-center cursor-pointer flex-shrink-0 md:order-2 md:w-full md:p-3 lg:p-1.5 xs:p-3">
          <div className="text-[10px] text-[#333] xs:text-[10px]">CLICK</div>
          <div className="text-xs text-black font-bold lg:text-[11px] xs:text-xs">Go to<br />SDP Projects</div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5 flex-shrink-0 items-center md:order-3 md:w-full md:grid-cols-3 md:grid-rows-2 md:gap-1.5 md:h-auto lg:gap-0.5 xs:gap-1">
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://dystec.co.kr/new/" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-1.png" alt="DONG YANG S·Tec" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.posco.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-2.png" alt="POSCO" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.steelall.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-3.png" alt="Steel Ball" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.p6ix.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-6.png" alt="p6sc" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.clbs.co.kr/main.jsp" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-5.png" alt="CLBS" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-0.5 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[38px] w-[55px] md:w-auto md:h-[40px] md:p-1 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.hyundai-steel.com" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-4.jfif" alt="HYUNDAI STEEL" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
