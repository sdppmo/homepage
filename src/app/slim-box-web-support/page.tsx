'use client';

import Link from 'next/link';

export default function SlimBoxWebSupportPage() {
  const handleProjectClick = (projectId: string) => {
    console.log('프로젝트 클릭:', projectId);
    // TODO: 프로젝트 상세 페이지로 이동하는 로직 추가
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] py-10 px-5">
      <div className="mx-auto max-w-[1600px] overflow-visible rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="bg-[linear-gradient(135deg,#1e3a5f,#2d5a87)] p-10 text-center text-white rounded-t-[20px]">
          <h1 className="mb-2.5 text-[36px] font-bold tracking-[-0.5px] md:text-[46.8px]">
            🏗️ D. M. I. S.
          </h1>
          <p className="text-[23.4px] font-light opacity-90">
            Design Management Information System (K-COL / Slim-BOX)
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg border border-white/30 bg-white/20 px-5 py-2.5 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30"
          >
            🏠 홈으로 돌아가기
          </Link>
        </div>

        <div className="p-5 md:p-[60px] md:px-[40px]">
          <div className="mb-[60px] last:mb-0">
            <div className="mb-0 rounded-t-2xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] p-[30px_40px] text-white">
              <h2 className="m-0 text-[28px] font-bold tracking-[-0.5px] md:text-[36px]">
                1. K-COL Design Management System
              </h2>
              <p className="mt-2 text-[18px] font-light opacity-90">
                Cross H형 강재 기둥 설계 및 제작 관리 시스템
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 rounded-b-2xl bg-[#f8fafc] p-5 md:grid-cols-2 md:gap-[30px] md:p-[40px]">
              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('kcol-1')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 1
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      K-COL 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('kcol-2')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏗️
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 2
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      K-COL 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('kcol-3')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏛️
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 3
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      K-COL 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('kcol-4')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏭
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 4
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      K-COL 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-[60px] last:mb-0">
            <div className="mb-0 rounded-t-2xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] p-[30px_40px] text-white">
              <h2 className="m-0 text-[28px] font-bold tracking-[-0.5px] md:text-[36px]">
                2. Slim-Box Design Management System
              </h2>
              <p className="mt-2 text-[18px] font-light opacity-90">
                Slim-Box 설계 및 제작 관리 시스템
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 rounded-b-2xl bg-[#f8fafc] p-5 md:grid-cols-2 md:gap-[30px] md:p-[40px]">
              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('slimbox-1')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 1
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      Slim-Box 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('slimbox-2')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 2
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      Slim-Box 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('slimbox-3')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏗️
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 3
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      Slim-Box 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-[#667eea] hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:p-[30px]"
                onClick={() => handleProjectClick('slimbox-4')}
              >
                <div className="mb-5 flex items-center gap-[15px] border-b-2 border-[#e2e8f0] pb-[15px]">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-[28px] text-white">
                    🏛️
                  </div>
                  <div className="flex-1">
                    <h3 className="m-[0_0_5px_0] text-[24px] font-bold text-[#1e3a5f]">
                      프로젝트 4
                    </h3>
                    <p className="m-0 text-[14px] text-[#718096]">
                      Slim-Box 프로젝트
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        프로젝트명
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        상태
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        시작일
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-[5px] text-[12px] font-semibold uppercase tracking-[0.5px] text-[#718096]">
                        완료율
                      </span>
                      <span className="text-[16px] font-semibold text-[#1e3a5f]">
                        -
                      </span>
                    </div>
                  </div>
                  <p className="mt-[15px] text-[14px] leading-[1.6] text-[#4a5568]">
                    프로젝트 정보를 입력하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
