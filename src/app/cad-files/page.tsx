import Link from 'next/link';

export const metadata = {
  title: 'CAD 파일 - SongDoPartners',
  description: '제품 설계 및 시공에 필요한 CAD 파일 자료',
};

export default function CadFilesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-10 px-5 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">📐 CAD 파일</h1>
          <p className="text-xl md:text-2xl opacity-90 font-light">제품 설계 및 시공에 필요한 CAD 파일 자료</p>
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
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">구조 설계 도면</h2>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">제작 상세도 - 기둥이음</h2>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
            <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
              <div className="text-5xl text-center mb-4">📐</div>
              <h3 className="text-2xl font-bold text-[#1a1a2e] mb-3 text-center">기둥 Splice Detail</h3>
              <p className="text-base text-gray-700 mb-5 text-center leading-relaxed">기둥 이음 상세도면 (DWG 파일)</p>
              <div className="text-sm text-gray-500 mb-5 text-center">파일 형식: DWG</div>
              <a href="/cad/기둥 splice detail_251124.dwg" className="inline-block py-3 px-6 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg text-center font-semibold transition-all duration-300 mt-auto hover:-translate-y-0.5 hover:shadow-lg" download>
                다운로드
              </a>
              <div className="flex justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                <span>파일명: 기둥 splice detail_251124.dwg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">시공 도면</h2>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">표준 도면 라이브러리</h2>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
          </div>
        </div>
      </div>
    </div>
  );
}
