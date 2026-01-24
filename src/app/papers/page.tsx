import Link from 'next/link';

export const metadata = {
  title: '논문 및 기술 자료 - SongDoPartners',
  description: '제품 및 기술에 관한 연구 논문과 기술 자료',
};

export default function PapersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-10 px-5 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">📄 논문 및 기술 자료</h1>
          <p className="text-xl md:text-2xl opacity-90 font-light">제품 및 기술에 관한 연구 논문과 기술 자료</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/products" className="inline-block py-2.5 px-5 bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/30 hover:bg-white/30 hover:-translate-y-0.5">
              ← 제품 페이지로 돌아가기
            </Link>
            <Link href="/" className="inline-block py-2.5 px-5 bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/30 hover:bg-white/30 hover:-translate-y-0.5">
              🏠 홈으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">구조 설계 연구</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center leading-snug">라흐타 센터 구조 설계 및 시공</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-5 flex-grow text-center">
                유럽에서 가장 높은 건물인 라흐타 센터의 구조 설계 및 시공에 관한 연구 논문입니다.
                Cross H형 강재 기둥의 구조적 성능과 시공 방법을 상세히 다룹니다.
              </p>
              <div className="text-sm text-gray-500 mb-5 text-center">
                <strong>출처:</strong> CTBUH (Council on Tall Buildings and Urban Habitat)
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">구조 설계</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">Cross H</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">고층건물</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">시공 사례</span>
              </div>
              <a href="https://global.ctbuh.org/resources/papers/download/4376-the-structural-engineering-design-and-construction-of-the-tallest-building-in-europe-lakhta-center-st-peters.pdf"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block w-full py-3 px-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg text-center font-semibold text-base transition-all duration-300 hover:from-[#764ba2] hover:to-[#667eea] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                📥 논문 다운로드 (PDF)
              </a>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">📐</div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center leading-snug">130-13 기술 자료</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-5 flex-grow text-center">
                구조 설계 관련 기술 자료입니다.
              </p>
              <div className="text-sm text-gray-500 mb-5 text-center">
                <strong>유형:</strong> 기술 자료
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">기술 자료</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">구조 설계</span>
              </div>
              <a href="/pdf/130-13.pdf"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block w-full py-3 px-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg text-center font-semibold text-base transition-all duration-300 hover:from-[#764ba2] hover:to-[#667eea] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                📥 자료 다운로드 (PDF)
              </a>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">성능 분석 논문</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">📊</div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center leading-snug">H형강 성능 분석 자료</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-5 flex-grow text-center">
                현대제철 H형강의 성능 분석 및 기술 자료입니다.
              </p>
              <div className="text-sm text-gray-500 mb-5 text-center">
                <strong>제조사:</strong> 현대제철
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">H형강</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">성능 분석</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">제품 자료</span>
              </div>
              <a href="/pdf/hyundai-steel-h-beam.pdf"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block w-full py-3 px-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg text-center font-semibold text-base transition-all duration-300 hover:from-[#764ba2] hover:to-[#667eea] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                📥 자료 다운로드 (PDF)
              </a>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center leading-snug">POS H 형강 기술 자료</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-5 flex-grow text-center">
                POS H 형강의 기술 자료 및 제품 사양서입니다.
              </p>
              <div className="text-sm text-gray-500 mb-5 text-center">
                <strong>제조사:</strong> POSCO
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">H형강</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">POSCO</span>
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">제품 사양</span>
              </div>
              <a href="/pdf/Pos-H Brochure step4.pdf"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block w-full py-3 px-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg text-center font-semibold text-base transition-all duration-300 hover:from-[#764ba2] hover:to-[#667eea] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                📥 자료 다운로드 (PDF)
              </a>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">기술 자료</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">📚</div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center leading-snug">추가 논문 및 자료</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-5 flex-grow text-center">
                추가 논문 및 기술 자료는 준비 중입니다.
                새로운 자료가 업데이트되면 이 페이지에 추가됩니다.
              </p>
              <div className="text-sm text-gray-500 mb-5 text-center">
                <strong>상태:</strong> 준비 중
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <span className="inline-block py-1 px-3 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">업데이트 예정</span>
              </div>
              <div className="inline-block w-full py-3 px-5 bg-gray-400 text-white rounded-lg text-center font-semibold text-base cursor-not-allowed opacity-60">
                📥 준비 중
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
