import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Consulting - SongDoPartners',
  description: 'Web Tool 기반 구조공법개발',
};

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#4facfe] bg-[length:400%_400%] animate-gradient-shift py-16 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(240,147,251,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(79,172,254,0.1)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-[#e0e7ff] drop-shadow-lg">
            💼 Consulting
          </h1>
          <div className="text-2xl md:text-3xl opacity-95 font-normal drop-shadow-md">Web Tool 기반 구조공법개발</div>
          <Link href="/" className="inline-block mt-6 py-3 px-7 bg-white/15 backdrop-blur-md text-white rounded-xl transition-all duration-300 border-2 border-white/30 font-semibold shadow-lg hover:bg-white/25 hover:-translate-y-1 hover:shadow-xl">
            🏠 홈으로 돌아가기
          </Link>
        </div>

        <div className="flex flex-col gap-16 mt-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/30">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-8 text-center pb-5 border-b-4 border-[#4facfe]">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#4facfe]">1.</span> 엔지니어링 컨설팅
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  🏢
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">장스팬 구조 컨설팅</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  스피드 강합성보 공기단축
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">건물특성에 맞는 장스팬보적용</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">시공하중반영 가설 안정성확보</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  ⬇️
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">대심도 탑다운 컨설팅</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  대심도 시공 기술 및 품질 관리 컨설팅
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">역레이커 삭제 공법</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">역레이커 설치현장 공기단축 방안제시</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">CFT기둥대체 공법</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#9333ea] to-[#7e22ce] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  🏗️
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">내진 SRC기둥<br />설계컨설팅</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  내진 설계를 고려한 SRC 기둥 구조 설계 컨설팅
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">SRC 기둥 구조 설계</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">수직철근사용절감으로 공기단축</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/30">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-8 text-center pb-5 border-b-4 border-[#4facfe]">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#4facfe]">2.</span> Product 개발
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  <Image src="/images/K-COL.jpg" alt="K-COL" width={100} height={100} className="w-full h-full object-contain rounded-3xl relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">K-COL</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  Cross H형 강재 기둥 설계 및 제작 관리 시스템
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">Cross H형 단면 설계</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">구조 계산 자동화</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">BOQ 산출 및 물량 관리</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  <Image src="/images/product-2.png" alt="Slim-BOX" width={100} height={100} className="w-full h-full object-contain rounded-3xl relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">Slim-BOX</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  흙막이용 CIP에 설치되는 H형강 강합성파일
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">흙막이용 CIP 설치</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">구조적 성능 향상</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">지하공사 안정성 확보</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#9333ea] to-[#7e22ce] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  <Image src="/images/product-3.png" alt="Slim-Beam" width={100} height={100} className="w-full h-full object-contain rounded-3xl relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">Slim-Beam</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  확장 가능한 슬림 빔 구조로 대형 공간 설계 최적화
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">단순한 보-기둥 접합부 적용</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">대형 경간 지원</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">슬림한 단면 구조</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/30">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-8 text-center pb-5 border-b-4 border-[#4facfe]">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#4facfe]">3.</span> 철골공정 Web software 개발
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  ⚙️
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">신설공장 철골기둥<br />공정관리개발</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  프로젝트 특성에 맞는 맞춤형 웹 소프트웨어 개발 서비스를 제공합니다.
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">시스템 설계 및 개발</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">테스트 및 품질 관리</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  🌐
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">구조계산자동화<br />프로그램개발</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  해외 철골공장 기둥설계 컨설팅
                </p>
                <ul className="list-none p-0 m-0">
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">복잡하고 시간이 걸리는 구조계산을 단순화</li>
                  <li className="py-3 pl-8 relative text-gray-800 text-base transition-all duration-300 hover:text-[#1a1a2e] hover:pl-9 before:content-['✓'] before:absolute before:left-0 before:text-[#4facfe] before:font-bold before:text-lg">Web Version으로 구조계산시간 절약</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#9333ea] to-[#7e22ce] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  🌍
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">해외기반 공장건설<br />철골물량관리 TOOL 개발</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  기둥철골물량의 정확한 물량산정 툴 개발
                </p>
                <ul className="list-none p-0 m-0">
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/30">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-8 text-center pb-5 border-b-4 border-[#4facfe]">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-[#f093fb] via-[#f5576c] to-[#4facfe]">4.</span> 지반안정성검토 자동화 TOOL 개발
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl transition-all duration-400 hover:-translate-y-2 hover:shadow-3xl border-2 border-white/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#4facfe] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
                <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center text-6xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] rounded-3xl shadow-lg transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                  🏗️
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 text-center">지반안정성검토 자동화 TOOL 개발</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 text-center">
                  AI를 이용한 지반안정성 검토 자동화 TOOL 개발
                </p>
                <ul className="list-none p-0 m-0">
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 mt-12 shadow-2xl border-2 border-white/30 text-center">
            <h2 className="text-4xl font-bold text-[#1a1a2e] mb-8">📞 컨설팅 문의</h2>
            <p className="text-lg text-gray-700 mb-8">
              전문 컨설팅 서비스에 대한 문의사항이 있으시면 언제든지 연락주세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="p-8 bg-[#4facfe]/10 rounded-xl transition-all duration-300 hover:bg-[#4facfe]/20 hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3">이메일</h3>
                <p><a href="mailto:sbd_pmo@naver.com" className="text-[#4facfe] no-underline font-semibold transition-colors duration-300 hover:text-[#f5576c]">sbd_pmo@naver.com</a></p>
              </div>
              <div className="p-8 bg-[#4facfe]/10 rounded-xl transition-all duration-300 hover:bg-[#4facfe]/20 hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3">본사 주소</h3>
                <p className="text-base text-gray-700 my-1">77-bungi, 42-bungil, Conventia Daero</p>
                <p className="text-base text-gray-700 my-1">Yeonsu-ku, Incheon, KOREA</p>
              </div>
              <div className="p-8 bg-[#4facfe]/10 rounded-xl transition-all duration-300 hover:bg-[#4facfe]/20 hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-3">홈페이지</h3>
                <p><a href="http://www.kcol.kr" target="_blank" className="text-[#4facfe] no-underline font-semibold transition-colors duration-300 hover:text-[#f5576c]">www.kcol.kr</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
