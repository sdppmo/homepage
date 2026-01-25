import Image from 'next/image';

const Footer = () => {
  return (
    <div className="flex flex-col h-auto w-full md:flex-row md:flex-shrink-0 md:h-[100px]">
      <div className="w-full p-2.5 h-auto bg-[#d0d0d0] flex justify-evenly items-center border-t-4 border-[#333] flex-shrink-0 md:w-[360px] md:p-0">
        <Image
          src="/images/product-1.png"
          alt="K-COL"
          width={90}
          height={90}
          className="w-[22%] h-auto object-contain mix-blend-multiply contrast-[1.3] saturate-[1.5] md:w-1/4 md:scale-100 md:translate-x-5"
        />
        <Image
          src="/images/product-2.png"
          alt="SLiM-BOX"
          width={90}
          height={90}
          className="w-[22%] h-auto object-contain mix-blend-multiply contrast-[1.3] saturate-[1.5] md:w-1/4 md:scale-75"
        />
        <Image
          src="/images/product-3.png"
          alt="ExSlim-Beam"
          width={90}
          height={90}
          className="w-[22%] h-auto object-contain mix-blend-multiply contrast-[1.3] saturate-[1.5] md:w-1/4 md:scale-115"
        />
        <Image
          src="/images/product-4.png"
          alt="COL"
          width={90}
          height={90}
          className="w-[22%] h-auto object-contain mix-blend-multiply contrast-[1.3] saturate-[1.5] md:w-1/4 md:scale-85 md:translate-y-1"
        />
      </div>

      <footer className="flex-1 bg-[#1a1a1a] flex flex-col h-auto p-4 gap-2.5 items-stretch z-20 relative border-t-4 border-[#333] overflow-hidden min-w-0 md:flex-row md:items-center md:justify-between md:p-2 md:gap-3 md:h-full">
        <div className="flex-1 min-w-0 text-sm text-[#ccc] leading-relaxed overflow-visible text-center whitespace-normal mb-1.5 order-1 md:overflow-hidden md:text-left md:whitespace-nowrap md:mb-0 md:order-none md:text-xs lg:text-[11px] xs:text-sm">
          <div className="whitespace-normal overflow-visible md:whitespace-nowrap md:overflow-hidden md:text-ellipsis md:max-w-full">
            Homepage : http://www.kcol.kr
          </div>
          <div className="whitespace-normal overflow-visible md:whitespace-nowrap md:overflow-hidden md:text-ellipsis md:max-w-full">
            E-Mail Address : If any problems, contact me : <a href="mailto:sbd_pmo@naver.com" className="text-[#6af] no-underline hover:underline">sbd_pmo@naver.com</a>
          </div>
          <div className="whitespace-normal overflow-visible md:whitespace-nowrap md:overflow-hidden md:text-ellipsis md:max-w-full">
            HQ. Address : 77-bungi, 42-bungil, Conventia Daero, Yeonsu-ku, Incheon, KOREA
          </div>
          <div className="whitespace-normal overflow-visible md:whitespace-nowrap md:overflow-hidden md:text-ellipsis md:max-w-full">
            Seoul Office Address : TBD
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#ffd700] to-[#cc9900] border-2 border-[#996600] p-3 text-center cursor-pointer flex-shrink-0 w-full order-2 md:p-1.5 md:w-auto md:order-none lg:p-1.5 xs:p-3">
          <div className="text-[10px] text-[#333] xs:text-[10px]">CLICK</div>
          <div className="text-xs text-black font-bold lg:text-[11px] xs:text-xs">Go to<br />SDP Projects</div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-1.5 h-auto flex-shrink-0 items-center w-full order-3 md:gap-0.5 md:w-auto md:order-none lg:gap-0.5 xs:gap-1">
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://dystec.co.kr/new/" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-1.png" alt="DONG YANG S·Tec" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.posco.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-2.png" alt="POSCO" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.steelall.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-3.png" alt="Steel Ball" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.p6ix.co.kr" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-6.png" alt="p6sc" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
            <a href="https://www.clbs.co.kr/main.jsp" target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
              <Image src="/images/network-5.png" alt="CLBS" width={55} height={38} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
          <div className="bg-white p-1 flex items-center justify-center border border-[#ddd] rounded-sm overflow-hidden h-[40px] w-auto md:h-[38px] md:w-[55px] md:p-0.5 lg:w-[50px] lg:h-[34px] lg:p-0.5 xs:h-[35px]">
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
