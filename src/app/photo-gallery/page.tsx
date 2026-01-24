'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function PhotoGalleryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const openModal = (src: string, alt: string) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-10 px-5 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">📸 사진 갤러리</h1>
          <p className="text-xl md:text-2xl opacity-90 font-light">제품 및 프로젝트 관련 사진 자료</p>
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
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">기중제작 커팅(유석철강)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl group select-none" onClick={() => openModal('/images/K-COL 제작/P-0.webp', '기둥제작 커팅')}>
              <Image
                src="/images/K-COL 제작/P-0.webp"
                alt="기둥제작 커팅"
                width={400}
                height={250}
                className="w-full h-[250px] object-cover block relative pointer-events-auto"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/40 text-white/90 py-4 px-5 rounded-lg text-2xl font-bold tracking-[3px] leading-tight pointer-events-none z-20 opacity-70 transition-opacity duration-300 text-shadow-lg border-2 border-white/30 group-hover:opacity-85 group-hover:bg-black/50 whitespace-pre text-center">
                K-{'\n'}COL
              </div>
              <div className="p-4 bg-white text-base text-[#2d3748] text-center font-medium">기둥제작 커팅</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">기둥조립(유석철강)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl group select-none" onClick={() => openModal('/images/K-COL 제작/p-1.webp', '기둥조립')}>
              <Image
                src="/images/K-COL 제작/p-1.webp"
                alt="기둥조립"
                width={400}
                height={250}
                className="w-full h-[250px] object-cover block relative pointer-events-auto"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/40 text-white/90 py-4 px-5 rounded-lg text-2xl font-bold tracking-[3px] leading-tight pointer-events-none z-20 opacity-70 transition-opacity duration-300 text-shadow-lg border-2 border-white/30 group-hover:opacity-85 group-hover:bg-black/50 whitespace-pre text-center">
                K-{'\n'}COL
              </div>
              <div className="p-4 bg-white text-base text-[#2d3748] text-center font-medium">기둥조립</div>
            </div>
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl group select-none" onClick={() => openModal('/images/K-COL 제작/p-2.webp', '기둥조립')}>
              <Image
                src="/images/K-COL 제작/p-2.webp"
                alt="기둥조립"
                width={400}
                height={250}
                className="w-full h-[250px] object-cover block relative pointer-events-auto"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/40 text-white/90 py-4 px-5 rounded-lg text-2xl font-bold tracking-[3px] leading-tight pointer-events-none z-20 opacity-70 transition-opacity duration-300 text-shadow-lg border-2 border-white/30 group-hover:opacity-85 group-hover:bg-black/50 whitespace-pre text-center">
                K-{'\n'}COL
              </div>
              <div className="p-4 bg-white text-base text-[#2d3748] text-center font-medium">기둥조립</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">상차사진</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b-3 border-white/30">현장설치사진</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/90 overflow-auto flex items-center justify-center" onClick={closeModal}>
          <span className="absolute top-5 right-9 text-[#f1f1f1] text-4xl font-bold cursor-pointer z-[1001] hover:text-white" onClick={closeModal}>&times;</span>
          <div className="relative m-auto p-5 w-[90%] max-w-[1200px]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={modalImageSrc}
              alt={modalImageAlt}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg select-none pointer-events-auto"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
