import Link from 'next/link';

export const metadata = {
  title: '동영상 자료 - SongDoPartners',
  description: '제품 소개, 시공 과정, 기술 설명 등의 동영상 자료',
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-10 px-5 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">🎬 동영상 자료</h1>
          <p className="text-xl md:text-2xl opacity-90 font-light">제품 소개, 시공 과정, 기술 설명 등의 동영상 자료</p>
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
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">제품 소개 동영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-4">
                <iframe
                  src="https://www.youtube.com/embed/7Ht_llhNbps"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-none"
                >
                </iframe>
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">제품 소개 동영상</h3>
              <p className="text-base text-gray-700 leading-relaxed">K-COL 및 기타 제품 소개 동영상입니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">시공 과정 영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                유튜브 동영상 링크를 추가하세요
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">시공 과정 영상</h3>
              <p className="text-base text-gray-700 leading-relaxed">현장 시공 과정을 보여주는 동영상입니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">기술 설명 영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                유튜브 동영상 링크를 추가하세요
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">기술 설명 영상</h3>
              <p className="text-base text-gray-700 leading-relaxed">제품 기술 및 구조 설계에 대한 설명 동영상입니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">프로젝트 하이라이트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                유튜브 동영상 링크를 추가하세요
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">프로젝트 하이라이트</h3>
              <p className="text-base text-gray-700 leading-relaxed">주요 프로젝트의 하이라이트 동영상입니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">교육 자료 영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                유튜브 동영상 링크를 추가하세요
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">교육 자료 영상</h3>
              <p className="text-base text-gray-700 leading-relaxed">제품 사용법 및 교육 자료 동영상입니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
