import Image from 'next/image';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] via-[#1a1a2e] to-[#16213e] bg-[length:400%_400%] animate-gradient-shift p-5 md:p-15 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(118,75,162,0.1)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="text-center text-white mb-15 md:mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-[#e0e7ff] drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            SongDoPartners<br />New Methodology
          </h1>
          <Link href="/" className="inline-block mt-6 px-7 py-3 bg-white/15 backdrop-blur-md text-white rounded-xl transition-all duration-300 border-2 border-white/30 font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-white/25 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
            🏠 홈으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-9 mt-10">
          {/* Panel 1: K-COL (공개) */}
          <Link href="/k-col/user-guide" className="no-underline text-inherit group">
            <div className="bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-white rounded-3xl p-11 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-[#0284c7] relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)] group-hover:bg-gradient-to-br group-hover:from-[#dbeafe] group-hover:via-[#93c5fd] group-hover:to-[#e0f2fe]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0284c7] to-[#0369a1] opacity-1 transition-opacity duration-300"></div>
              <div className="text-7xl text-center mb-6 transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] w-30 h-30 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:rotate-3">
                <Image src="/images/K-COL.jpg" alt="K-COL" width={120} height={120} className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl md:text-2xl font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent text-center mb-5 tracking-tighter">K-COL</h2>
              <p className="text-lg text-[#4a5568] leading-relaxed text-center mb-7 font-normal">
                K-COL은 Cross H형 강재 기둥 설계 및 제작 관리 시스템입니다.
                TOP-DOWN 공법에 최적화된 구조 설계를 지원합니다.
              </p>
              <div className="bg-gradient-to-br from-[#f7fafc] to-[#edf2f7] rounded-2xl p-7 mt-6 border border-[#e2e8f0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                <ul className="list-none p-0">
                  {['Cross H형 단면 설계', 'TOP-DOWN 공법 지원', '구조 계산 자동화', '공정 관리 시스템', '현장 Mapping 기능'].map((item, index) => (
                    <li key={index} className="py-3.5 pl-9 relative text-lg text-[#2d3748] leading-relaxed transition-all duration-200 rounded-lg my-1 hover:bg-[#667eea]/8 hover:translate-x-1 hover:pl-10 before:content-['✓'] before:absolute before:left-2 before:text-[#667eea] before:font-bold before:text-2xl before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent before:transition-transform before:duration-200 hover:before:scale-120">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>

          {/* Panel 2: Slim-Box */}
          <div className="bg-gradient-to-br from-[#b0d4bf] via-[#90c4a0] to-[#d0d0d0] rounded-3xl p-11 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border-2 border-[#16a34a] relative overflow-hidden opacity-60 cursor-default">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16a34a] to-[#15803d] opacity-1"></div>
            <div className="text-7xl text-center mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] w-30 h-30 mx-auto flex items-center justify-center">
              <Image src="/images/product-2.png" alt="Slim-Box" width={120} height={120} className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl md:text-2xl font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent text-center mb-5 tracking-tighter">
              Slim-Box 실험 <span className="bg-[#fbbf24] text-[#92400e] px-3 py-1 rounded-xl text-sm font-semibold ml-2 bg-clip-border">준비중</span>
            </h2>
            <p className="text-lg text-[#4a5568] leading-relaxed text-center mb-7 font-normal">
              Slim-Box는 흙막이용 CIP에 설치되는 H형강을 강합성파일로 구조적성능을 발휘하기 위해 특별히 제작된 흙막이 가시설 파일입니다.
            </p>
            <div className="bg-gradient-to-br from-[#f7fafc] to-[#edf2f7] rounded-2xl p-7 mt-6 border border-[#e2e8f0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <ul className="list-none p-0">
                {['흙막이용 CIP 설치 적용', 'H형강 강합성파일 구조', '구조적 성능 향상', '가시설 파일 특수 제작', '지하공사 안정성 확보'].map((item, index) => (
                  <li key={index} className="py-3.5 pl-9 relative text-lg text-[#2d3748] leading-relaxed transition-all duration-200 rounded-lg my-1 hover:bg-[#667eea]/8 hover:translate-x-1 hover:pl-10 before:content-['✓'] before:absolute before:left-2 before:text-[#667eea] before:font-bold before:text-2xl before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent before:transition-transform before:duration-200 hover:before:scale-120">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Panel 3: EX_Slim-Beam */}
          <div className="bg-gradient-to-br from-[#c8b8d8] via-[#b098c0] to-[#d0d0d0] rounded-3xl p-11 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border-2 border-[#9333ea] relative overflow-hidden opacity-60 cursor-default">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9333ea] to-[#7e22ce] opacity-1"></div>
            <div className="text-7xl text-center mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] w-30 h-30 mx-auto flex items-center justify-center">
              <Image src="/images/product-3.png" alt="EX_Slim-Beam" width={120} height={120} className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl md:text-2xl font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent text-center mb-5 tracking-tighter">
              EX_Slim-Beam <span className="bg-[#fbbf24] text-[#92400e] px-3 py-1 rounded-xl text-sm font-semibold ml-2 bg-clip-border">준비중</span>
            </h2>
            <p className="text-lg text-[#4a5568] leading-relaxed text-center mb-7 font-normal">
              EX_Slim-Beam은 확장 가능한 슬림 빔 구조로 대형 공간 설계에 최적화된 제품입니다.
              긴 경간 구조에 효율적으로 적용할 수 있습니다.
            </p>
            <div className="bg-gradient-to-br from-[#f7fafc] to-[#edf2f7] rounded-2xl p-7 mt-6 border border-[#e2e8f0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <ul className="list-none p-0">
                {['확장 가능한 설계', '대형 경간 지원', '슬림한 단면', '구조 효율성', '시공 용이성'].map((item, index) => (
                  <li key={index} className="py-3.5 pl-9 relative text-lg text-[#2d3748] leading-relaxed transition-all duration-200 rounded-lg my-1 hover:bg-[#667eea]/8 hover:translate-x-1 hover:pl-10 before:content-['✓'] before:absolute before:left-2 before:text-[#667eea] before:font-bold before:text-2xl before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent before:transition-transform before:duration-200 hover:before:scale-120">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Small Panels Container (사진, 논문, 동영상) */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-1 gap-5 mt-5">
            {/* Panel 4: 개발자용 설명서 (운영자 전용) - TODO: Implement auth check */}
            {/* <Link href="/k-col-web-software/k-col-developer-guide" className="no-underline text-inherit group">
              <div className="bg-gradient-to-br from-[#fff5f5] to-white rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-white/80 relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="flex items-center justify-start gap-5">
                  <div className="text-2xl m-0 p-0 w-15 h-15 min-w-15 min-h-15 flex items-center justify-center transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3">
                    <Image src="/images/K-COL.jpg" alt="K-COL" width={60} height={60} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent m-0">K-COL 개발자 안내서</h2>
                    <p className="text-sm text-[#666] m-0">운영자 전용 개발자 메뉴얼입니다.</p>
                  </div>
                </div>
              </div>
            </Link> */}

            {/* Panel 5: K-COL 사진 */}
            <Link href="/photo-gallery" className="no-underline text-inherit group">
              <div className="bg-gradient-to-br from-[#f0fff4] to-white rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-white/80 relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl m-0 p-0 w-auto h-auto min-w-auto min-h-auto flex items-center justify-center transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3">📸</div>
                    <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent mt-1 mb-0">K-COL 사진</h2>
                  </div>
                  <div className="flex-0-1-auto max-w-[70%] p-3 mt-2">
                    <ul className="flex flex-wrap gap-4 list-none p-0">
                      {['제품 상세 이미지', '현장 시공 사진', '프로젝트 갤러리', '구조 상세 사진', '시공 과정 기록'].map((item, index) => (
                        <li key={index} className="py-1.5 px-2.5 pl-5.5 relative text-sm text-[#2d3748] leading-relaxed flex-0-0-auto before:content-['✓'] before:absolute before:left-1 before:text-[#667eea] before:font-bold before:text-sm before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Panel 6: Cross H 논문 */}
            <Link href="/papers" className="no-underline text-inherit group">
              <div className="bg-gradient-to-br from-[#f0f9ff] to-white rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-white/80 relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl m-0 p-0 w-auto h-auto min-w-auto min-h-auto flex items-center justify-center transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3">📄</div>
                    <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent mt-1 mb-0">Cross H 논문</h2>
                  </div>
                  <div className="flex-0-1-auto max-w-[70%] p-3 mt-2">
                    <ul className="flex flex-wrap gap-4 list-none p-0">
                      {['구조 설계 연구', '성능 분석 논문', '시공 사례 연구', '기술 자료', '학술 논문'].map((item, index) => (
                        <li key={index} className="py-1.5 px-2.5 pl-5.5 relative text-sm text-[#2d3748] leading-relaxed flex-0-0-auto before:content-['✓'] before:absolute before:left-1 before:text-[#667eea] before:font-bold before:text-sm before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Panel 7: K-COL 동영상 */}
            <Link href="/videos" className="no-underline text-inherit group">
              <div className="bg-gradient-to-br from-[#fef3c7] to-white rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-white/80 relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl m-0 p-0 w-auto h-auto min-w-auto min-h-auto flex items-center justify-center transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3">🎬</div>
                    <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent mt-1 mb-0">K-COL 동영상</h2>
                  </div>
                  <div className="flex-0-1-auto max-w-[70%] p-3 mt-2">
                    <ul className="flex flex-wrap gap-4 list-none p-0">
                      {['제품 소개 동영상', '시공 과정 영상', '기술 설명 영상', '프로젝트 하이라이트', '교육 자료 영상'].map((item, index) => (
                        <li key={index} className="py-1.5 px-2.5 pl-5.5 relative text-sm text-[#2d3748] leading-relaxed flex-0-0-auto before:content-['✓'] before:absolute before:left-1 before:text-[#667eea] before:font-bold before:text-sm before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Panel 8: K-COL CAD-Files */}
            <Link href="/cad-files" className="no-underline text-inherit group">
              <div className="bg-gradient-to-br from-[#e0c0d0] to-[#d0d0d0] rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-400 cubic-bezier(0.175,0.885,0.32,1.275) border-2 border-white/80 relative overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl m-0 p-0 w-auto h-auto min-w-auto min-h-auto flex items-center justify-center transition-transform duration-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3">📐</div>
                    <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent mt-1 mb-0">K-COL CAD-Files</h2>
                  </div>
                  <div className="flex-0-1-auto max-w-[70%] p-3 mt-2">
                    <ul className="flex flex-wrap gap-4 list-none p-0">
                      {['구조 설계 도면', '제작 상세도', '시공 도면', '표준 도면 라이브러리', '2D/3D CAD 파일'].map((item, index) => (
                        <li key={index} className="py-1.5 px-2.5 pl-5.5 relative text-sm text-[#2d3748] leading-relaxed flex-0-0-auto before:content-['✓'] before:absolute before:left-1 before:text-[#667eea] before:font-bold before:text-sm before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Panel 9: Slim-Box 실험 (준비중) */}
            <div className="bg-gradient-to-br from-[#e0c0d0] to-[#d0d0d0] rounded-3xl p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border-2 border-white/80 relative overflow-hidden opacity-60 cursor-default">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-1"></div>
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="text-2xl m-0 p-0 w-auto h-auto min-w-auto min-h-auto flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]">🔬</div>
                  <h2 className="text-lg font-extrabold bg-gradient-to-br from-[#1e3a5f] to-[#667eea] bg-clip-text text-transparent mt-1 mb-0">
                    Slim-Box 실험 <span className="bg-[#fbbf24] text-[#92400e] px-2 py-0.5 rounded-lg text-xs font-semibold ml-2 bg-clip-border">준비중</span>
                  </h2>
                </div>
                <div className="flex-0-1-auto max-w-[70%] p-3 mt-2">
                  <ul className="flex flex-wrap gap-4 list-none p-0">
                    {['구조 성능 실험', '시공 특성 분석', '내구성 시험', '실험 데이터 자료', '연구 결과 보고서'].map((item, index) => (
                      <li key={index} className="py-1.5 px-2.5 pl-5.5 relative text-sm text-[#2d3748] leading-relaxed flex-0-0-auto before:content-['✓'] before:absolute before:left-1 before:text-[#667eea] before:font-bold before:text-sm before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:bg-clip-text before:text-transparent">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
