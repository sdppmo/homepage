import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'K-COL 개발자 안내서 - SongDoPartners',
  description: 'K-COL 소프트웨어 운영자 전용 개발자 메뉴얼입니다.',
};

export default function DeveloperGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-10 px-5">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white p-10 text-center">
          <h1 className="text-[46.8px] font-bold mb-2.5 tracking-[-0.5px]">📘 K-COL 개발자 안내서</h1>
          <p className="text-[23.4px] opacity-90 font-light">운영자 전용 개발자 메뉴얼</p>
          <Link
            href="/"
            className="inline-block mt-5 py-2.5 px-5 bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/30 hover:bg-white/30 hover:-translate-y-0.5"
          >
            🏠 홈으로 돌아가기
          </Link>
        </div>

        <div className="p-[50px_40px] bg-gradient-to-b from-[#f8fafc] to-white">
          <div className="bg-gradient-to-br from-[#f0f4ff] to-white rounded-2xl p-[30px] mb-[50px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border-2 border-[#e2e8f0]">
            <h2 className="text-[28.08px] font-bold text-[#1e3a5f] mb-5 pb-[15px] border-b-[3px] border-[#667eea]">
              📑 목차
            </h2>
            <ul className="list-none p-0 m-0">
              {[
                { id: 'top-method', title: '1. TOP-DOWN 공법 (탑다운공법)' },
                { id: 'structure-calculation', title: '2. 구조 계산' },
                { id: 'auto-find-section', title: '3. A.F.S (Auto Find Section)' },
                { id: 'boq', title: '4. BOQ 계산' },
                { id: 'column-plan', title: '5. A.D.C Function' },
                { id: 'process-system', title: '6. 공정관리시스템(제작+현장설치)' },
                { id: 'mapping', title: '7. 현장기둥설치 Mapping' },
                { id: 'case-studies', title: '5. Cross H 건물 사례' },
                { id: 'highrise-case', title: '6. 초고층 건물 사례' },
                { id: 'factory-photos', title: '7. 공장 사진' },
                { id: 'temporary-construction', title: '8. 가설건축공사' },
                { id: 'cross-h-structural-features', title: '9. Cross H 구조적 특징 및 장점과 CFT 비교' },
              ].map((item) => (
                <li key={item.id} className="mb-3">
                  <a
                    href={`#${item.id}`}
                    className="flex items-center p-[12px_18px] bg-white rounded-[10px] text-[#4a5568] text-[19.2px] transition-all duration-300 border-l-4 border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-gradient-to-br hover:from-[#667eea] hover:to-[#764ba2] hover:text-white hover:translate-x-[5px] hover:border-l-[#ffd700] hover:shadow-[0_4px_12px_rgba(102,126,234,0.3)] group"
                  >
                    <span className="mr-3 text-[18px] group-hover:hidden">📌</span>
                    <span className="mr-3 text-[18px] hidden group-hover:inline">👉</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <section
            id="top-method"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                1. TOP-DOWN 공법 (탑다운공법)
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                TOP-DOWN 공법은 지하 구조물과 지상 구조물을 동시에 시공하는 공법으로, K-COL 시스템에 최적화된 시공
                방법입니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                K-COL의 TOP-DOWN공법의 주요 특징
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  {
                    title: '타설 콘크리트 없음:',
                    desc: 'CFT(Concrete Filled Tube)와 달리 타설 콘크리트가 없어 품질 관리가 용이합니다.',
                  },
                  {
                    title: '동절기 공사 우수:',
                    desc: '콘크리트 타설이 필요 없어 동절기 공사 시 공기 단축에 효과적입니다.',
                  },
                  {
                    title: '볼트 체결 방식:',
                    desc: '현장 용접이 아닌 볼트 체결 방식을 적용하여 공기 단축 및 품질 관리에 우수합니다.',
                  },
                  {
                    title: '공장 제작:',
                    desc: '공장에서 제작되어 현장 시공 시간을 단축할 수 있습니다.',
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    <strong className="text-[#1e3a5f] font-bold bg-gradient-to-br from-[#f0f4ff] to-transparent p-[2px_6px] rounded">
                      {item.title}
                    </strong>{' '}
                    {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                TOP-DOWN 공법과 K-COL의 관계
              </h3>
              <p className="mb-[18px] pl-[10px]">
                K-COL은 TOP-DOWN 공법의 특성에 맞춰 설계되었습니다.{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 단면을 활용하여 X방향과 Y방향 모두에서 동일한 구조 성능을 발휘하며, 볼트 체결을 통한 빠른 시공이
                가능합니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] border-l-[6px] border-[#667eea] p-[30px] rounded-2xl m-[30px_0] shadow-[0_4px_16px_rgba(102,126,234,0.15)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-right-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(102,126,234,0.1)_0%,transparent_70%)] before:pointer-events-none">
              <strong className="text-[22.88px] text-[#1e3a5f] block mb-[15px] relative z-10">
                💡 K-COL의 TOP-DOWN공법의 최적화
              </strong>
              <p className="text-[20.8px] leading-[1.8] text-[#4a5568] m-0 relative z-10">
                K-COL은 TOP-DOWN 공법의 장점을 극대화하기 위해 설계되었습니다. 공장 제작, 볼트 체결, 콘크리트 타설
                불필요 등의 특징을 통해 공기 단축과 품질 향상을 동시에 달성할 수 있습니다.
              </p>
            </div>
          </section>

          <section
            id="structure-calculation"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                2. 구조 계산
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                K-COL 구조 계산 기능은{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 단면의 구조 설계를 자동화하여 정확한 구조 계산을 수행합니다.
              </p>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/K-COL-CAL.png"
                alt="SRC (Cross H) Design Calculator 화면"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
              <p className="mt-[15px] text-base text-[#666] italic">SRC (Cross H) Design Calculator 인터페이스</p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                SRC (Cross H) Design Calculator 주요 기능
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  {
                    title: '단면 타입 선택:',
                    desc: 'Rolled H 또는 Pos-H / Built-UP H 중 선택 가능',
                  },
                  {
                    title: '단면 치수 입력:',
                    desc: 'Major (H1)와 Minor (H2) 단면의 상세 치수 입력 (H, B, tw, tf, r)',
                  },
                  {
                    title: '강재 재료:',
                    desc: '강재 등급(SM275, SM355, SM420 등), 항복강도(Fy), 탄성계수(E), 포아송비(v) 설정',
                  },
                  {
                    title: '좌굴 길이 계수:',
                    desc: 'Kx, Ky, Kz 및 횡좌굴 계수(Cb) 설정',
                  },
                  {
                    title: '비지지 길이:',
                    desc: 'Lx, Ly, Lb 입력',
                  },
                  {
                    title: '설계 하중:',
                    desc: '축력(Pu), 휨모멘트(Mux, Muy), 전단력(Vux, Vuy) 입력',
                  },
                  {
                    title: '간편 계산:',
                    desc: '1-Column에 대한 빠른 구조 계산 수행',
                  },
                  {
                    title: '다중 기둥 계산:',
                    desc: '여러 기둥에 대한 일괄 계산 및 결과 비교',
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    <strong className="text-[#1e3a5f] font-bold bg-gradient-to-br from-[#f0f4ff] to-transparent p-[2px_6px] rounded">
                      {item.title}
                    </strong>{' '}
                    {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                계산 결과 항목
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  {
                    title: '압축력 검토:',
                    desc: 'Pu/φPn (축력에 대한 압축 강도 비)',
                  },
                  {
                    title: '휨모멘트 검토:',
                    desc: 'Mux/φMnx, Muy/φMny (X, Y 방향 휨 강도 비)',
                  },
                  {
                    title: 'P-M-M 조합 검토:',
                    desc: '축력과 휨모멘트의 조합 검토',
                  },
                  {
                    title: '전단력 검토:',
                    desc: 'Vux/φVnx, Vuy/φVny (X, Y 방향 전단 강도 비)',
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    <strong className="text-[#1e3a5f] font-bold bg-gradient-to-br from-[#f0f4ff] to-transparent p-[2px_6px] rounded">
                      {item.title}
                    </strong>{' '}
                    {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                사용 방법
              </h3>
              <ol className="list-none counter-reset-step-counter ml-5 mb-[25px] pl-[50px]">
                {[
                  '메인 페이지에서 "K-COL Web Software" 메뉴를 클릭합니다.',
                  '구조 계산 페이지에서 단면 타입을 선택합니다 (Rolled H 또는 Pos-H / Built-UP H).',
                  <>
                    <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                      Cross H
                    </span>
                    형 단면의 치수를 입력합니다 (H1, B1, tw1, tf1, H2, B2, tw2, tf2 등).
                  </>,
                  '강재 등급(SM275, SM355, SM420 등) 및 재료 특성을 설정합니다.',
                  '좌굴 길이 계수(Kx, Ky, Kz) 및 비지지 길이(Lx, Ly, Lb)를 입력합니다.',
                  '설계 하중을 입력합니다 (축력, 휨모멘트, 전단력 등).',
                  '"간편계산(1-Column)" 버튼을 클릭하여 구조 계산을 실행합니다.',
                  '계산 결과를 확인하고, 필요시 단면을 수정하여 재계산합니다.',
                  '여러 기둥에 대한 계산이 필요한 경우, "Multi Column Execution" 버튼을 사용합니다.',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="counter-increment-step-counter relative pl-[50px] mb-[18px] leading-[1.8] before:content-[counter(step-counter)] before:absolute before:left-0 before:top-0 before:w-8 before:h-8 before:bg-gradient-to-br before:from-[#1e3a5f] before:to-[#2d5a87] before:text-white before:rounded-lg before:flex before:items-center before:justify-center before:text-base before:font-bold before:shadow-[0_2px_8px_rgba(30,58,95,0.3)]"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] border-l-[6px] border-[#667eea] p-[30px] rounded-2xl m-[30px_0] shadow-[0_4px_16px_rgba(102,126,234,0.15)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-right-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(102,126,234,0.1)_0%,transparent_70%)] before:pointer-events-none">
              <strong className="text-[22.88px] text-[#1e3a5f] block mb-[15px] relative z-10">
                💡 운영자 Control 기능
              </strong>
              <p className="text-[20.8px] leading-[1.8] text-[#4a5568] m-0 relative z-10">
                운영자 권한이 있는 사용자는 <strong>"운영자 Control"</strong> 섹션을 통해 전체 계산서 출력, A.F.S.
                Function, SRC (Cross H), A. D. C. Function 등의 고급 기능을 사용할 수 있습니다.
              </p>
            </div>
          </section>

          <section
            id="auto-find-section"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                3. A.F.S (Auto Find Section)
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                Auto Find Section 기능은 입력된 하중 조건에 맞는 최적의{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 단면을 자동으로 찾아줍니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                사용 방법
              </h3>
              <ol className="list-none counter-reset-step-counter ml-5 mb-[25px] pl-[50px]">
                {[
                  '구조 계산 페이지에서 "Auto Find Section" 메뉴로 이동합니다.',
                  '하중 조건을 입력합니다 (축력, 휨모멘트, 전단력 등).',
                  '강재 등급 및 좌굴 조건을 설정합니다.',
                  '제약 조건을 입력합니다 (최소/최대 높이, 폭 등).',
                  '"단면 찾기" 버튼을 클릭합니다.',
                  '시스템이 데이터베이스에서 조건에 맞는 최적 단면을 검색합니다.',
                  '검색된 단면 목록을 확인하고 적절한 단면을 선택합니다.',
                  '선택한 단면으로 구조 계산을 수행하여 검증합니다.',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="counter-increment-step-counter relative pl-[50px] mb-[18px] leading-[1.8] before:content-[counter(step-counter)] before:absolute before:left-0 before:top-0 before:w-8 before:h-8 before:bg-gradient-to-br before:from-[#1e3a5f] before:to-[#2d5a87] before:text-white before:rounded-lg before:flex before:items-center before:justify-center before:text-base before:font-bold before:shadow-[0_2px_8px_rgba(30,58,95,0.3)]"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/AFS.png"
                alt="Auto Find Section 결과"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
              <p className="mt-[15px] text-base text-[#666] italic">Auto Find Section 결과 화면</p>
            </div>
          </section>

          <section
            id="boq"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                4. BOQ 계산
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                BOQ(Bill of Quantities) 계산 기능은 프로젝트에 필요한{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 기둥의 물량을 자동으로 산출합니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                사용 방법
              </h3>
              <ol className="list-none counter-reset-step-counter ml-5 mb-[25px] pl-[50px]">
                {[
                  '메인 페이지에서 "K-COL Web Software" 메뉴를 클릭합니다.',
                  'Auto Find Section을 수행합니다.',
                  '"BOQ Report" 메뉴로 이동합니다.',
                  '프로젝트 정보를 입력합니다 (프로젝트명, 건물 정보 등).',
                  '각 층별 기둥 정보를 입력합니다 (기둥 번호, 단면 치수, 높이 등).',
                  '강재 등급 및 단가 정보를 입력합니다.',
                  '"물량 산출" 버튼을 클릭합니다.',
                  '계산된 물량을 확인하고, 필요시 수정합니다.',
                  '"보고서 출력" 버튼을 클릭하여 BOQ 보고서를 생성합니다.',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="counter-increment-step-counter relative pl-[50px] mb-[18px] leading-[1.8] before:content-[counter(step-counter)] before:absolute before:left-0 before:top-0 before:w-8 before:h-8 before:bg-gradient-to-br before:from-[#1e3a5f] before:to-[#2d5a87] before:text-white before:rounded-lg before:flex before:items-center before:justify-center before:text-base before:font-bold before:shadow-[0_2px_8px_rgba(30,58,95,0.3)]"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/BOQ-1.png"
                alt="BOQ 계산 예시 1"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0] mb-5"
              />
              <Image
                src="/images/BOQ-2.png"
                alt="BOQ 계산 예시 2"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
            </div>
          </section>

          <section
            id="column-plan"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                5. A.D.C Function
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                기둥평면도와 기둥번호를 입력하여 프로젝트의 구조 정보를 관리합니다.
              </p>
              <p className="mb-[18px] pl-[10px]">
                기둥당 면적분배를 자동으로 계산하고 면적분배의 적정성을 검토하여 불필요한 기둥을 삭제 또는 기둥간격을
                조정할 수 있도록 합니다.
              </p>
              <p className="mb-[18px] pl-[10px]">
                이기능은 특히 탑다운 기둥 Naming 및 Grouping에 유효한 기능입니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                주요 기능
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  '기둥평면도 업로드 및 관리',
                  '기둥번호 입력 및 수정',
                  '평면도와 기둥 정보 연동',
                  '기둥 분배면적의 최적화',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                사용 방법
              </h3>
              <ol className="list-none counter-reset-step-counter ml-5 mb-[25px] pl-[50px]">
                {[
                  '기둥평면도 파일을 업로드합니다.',
                  '각 기둥의 번호를 입력합니다.',
                  '평면도와 기둥 정보를 연동하여 확인합니다.',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="counter-increment-step-counter relative pl-[50px] mb-[18px] leading-[1.8] before:content-[counter(step-counter)] before:absolute before:left-0 before:top-0 before:w-8 before:h-8 before:bg-gradient-to-br before:from-[#1e3a5f] before:to-[#2d5a87] before:text-white before:rounded-lg before:flex before:items-center before:justify-center before:text-base before:font-bold before:shadow-[0_2px_8px_rgba(30,58,95,0.3)]"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/ADC-1.png"
                alt="A.D.C Function 예시 1"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0] mb-5"
              />
              <Image
                src="/images/ADC-2.png"
                alt="A.D.C Function 예시 2"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
            </div>
          </section>

          <section
            id="process-system"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                6. 공정관리시스템(제작+현장설치)
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                공정 관리 시스템은 제작자와 현장 간 실시간으로 제작 공정을 공유하여 효율적인 프로젝트 관리를
                지원합니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                주요 기능
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  {
                    title: '실시간 공정 공유:',
                    desc: '제작자와 현장 간 일일 입력 데이터를 실시간으로 공유합니다.',
                  },
                  {
                    title: 'PRD 시공순서 변경 대응:',
                    desc: '현장의 PRD(시공순서) 변경에 빠르게 대응할 수 있습니다.',
                  },
                  {
                    title: '제작 공정 모니터링:',
                    desc: '제작품 출하 상차 전 제작 공정 현황을 실시간으로 모니터링할 수 있습니다.',
                  },
                  {
                    title: '공정표 관리:',
                    desc: '선후단계 공정을 파악할 수 있는 공정표 기능을 제공합니다. (현장기둥설치공정포함)',
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    <strong className="text-[#1e3a5f] font-bold bg-gradient-to-br from-[#f0f4ff] to-transparent p-[2px_6px] rounded">
                      {item.title}
                    </strong>{' '}
                    {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/schedule.png"
                alt="공정관리시스템 예시"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
            </div>
          </section>

          <section
            id="mapping"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                7. 현장기둥설치 Mapping
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                현장 Mapping 기능은 현장에서 기둥 설치 위치를 시각적으로 관리하고 추적할 수 있는 기능입니다. 설치가
                완료된 기둥과 미완료된 기둥의 설치완료율을 확인하고 완료된 기둥을 Web Page상에서 시각적으로 확인할 수
                있는 기능을 제공한다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                사용 방법
              </h3>
              <ol className="list-none counter-reset-step-counter ml-5 mb-[25px] pl-[50px]">
                {[
                  '메인 페이지에서 "K-COL Web Software" 메뉴를 클릭합니다.',
                  '"Mapping" 메뉴로 이동합니다.',
                  '건물 평면도를 업로드하거나 직접 그립니다.',
                  '각 기둥의 위치를 평면도에 표시합니다.',
                  '기둥 번호 및 단면 정보를 입력합니다.',
                  '설치 상태를 업데이트합니다 (미설치, 설치 중, 설치 완료 등).',
                  '설치 일정 및 현황을 실시간으로 확인합니다.',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="counter-increment-step-counter relative pl-[50px] mb-[18px] leading-[1.8] before:content-[counter(step-counter)] before:absolute before:left-0 before:top-0 before:w-8 before:h-8 before:bg-gradient-to-br before:from-[#1e3a5f] before:to-[#2d5a87] before:text-white before:rounded-lg before:flex before:items-center before:justify-center before:text-base before:font-bold before:shadow-[0_2px_8px_rgba(30,58,95,0.3)]"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="m-[40px_0] text-center">
              <Image
                src="/images/mapping.png"
                alt="현장기둥설치 Mapping 예시"
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-[#e2e8f0]"
              />
            </div>
          </section>

          <section
            id="case-studies"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                5. Cross H 건물 사례
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 강재 기둥은 전 세계적으로 다양한 건물 유형에 적용되고 있습니다.{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                를 이용한 건물은 <strong>X방향과 Y방향의 동일한 구조 성능</strong>으로 설계가 용이하며,{' '}
                <strong>TOP-DOWN 공법</strong> 뿐만 아니라 슬래브를 받는 보 및 거더의 기둥접합 특성상{' '}
                <strong>양방향 모멘트를 받는 SRC기둥</strong>에 적용이 가능하고 기둥이음은 현장 용접을 사용하지 않고
                기둥 플랜지 및 웨브를 현장 <strong>볼트 체결 방식</strong>으로 공기를 단축할 수 있어 공기단축이 필요한
                초고층 건물, 장스팬 오피스 건물, 장경간 내부공간이 필요한 공장기둥, 기하학적 형태를 지닌 복합시설 등
                다양한 건축물에 효과적으로 활용되고 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] mt-10">
              {[
                { src: '/images/Shimizu/office.png', title: '오피스 건물' },
                { src: '/images/Shimizu/complex.jpg', title: '복합시설' },
                { src: '/images/Shimizu/jakarta.png', title: '기타 건물' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#e2e8f0] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(102,126,234,0.2)] hover:border-[#667eea] group"
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={400}
                    height={350}
                    className="w-full h-[350px] object-contain bg-gradient-to-br from-[#f8fafc] to-white p-5 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="p-[25px] text-[22.88px] font-bold text-[#1e3a5f] text-center bg-gradient-to-br from-[#f0f4ff] to-white border-t-[3px] border-[#667eea]">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="highrise-case"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                6. 초고층 건물 사례
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <div className="text-center mb-[30px]">
                <h3 className="text-[32px] font-bold text-[#1e3a5f] mb-[15px]">
                  🏢 라흐타 센터 (Lakhta Center)
                </h3>
                <p className="text-[20px] text-[#4a5568] leading-[1.7] max-w-[900px] mx-auto m-0">
                  러시아 상트페테르부르크에 위치한 <strong>유럽에서 가장 높은 건물</strong>로,{' '}
                  <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                    Cross H
                  </span>
                  형 강재 기둥이 적용된 대표적인 초고층 건물 사례입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 m-[30px_0]">
                {[
                  { icon: '📍', title: '위치', desc: '러시아\n상트페테르부르크' },
                  { icon: '📏', title: '높이', desc: '462m\n(87층)' },
                  { icon: '📅', title: '완공', desc: '2018년\n(6년 공사)' },
                  { icon: '🏆', title: '수상', desc: 'CTBUH 2019\n최고층 건물상' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-5 text-center bg-gradient-to-br from-[#f0f4ff] to-white rounded-2xl border-2 border-[#e2e8f0] shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
                  >
                    <div className="text-[36px] mb-[10px]">{item.icon}</div>
                    <div className="text-[16px] font-bold text-[#1e3a5f] mb-2">{item.title}</div>
                    <div className="text-[15px] text-[#2d3748] whitespace-pre-line">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="p-[56px_16px] mt-[50px]">
                <div className="max-w-[1050px] mx-auto">
                  <div className="mb-[22px]">
                    <h2 className="m-[0_0_10px] text-[28px] font-bold text-[#1e3a5f]">
                      🏗️ 구조시스템 핵심 특징
                    </h2>
                    <p className="m-[0_0_22px] leading-[1.7] opacity-90">
                      혹한 환경·연약지반·비틀림 형상을 동시에 고려한 초고층 하이브리드 구조 시스템
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                    {[
                      {
                        title: '1) RC 코어 + 철골 외곽 시스템',
                        desc: '중앙 RC 코어가 강성을 담당하고, 외곽 철골 프레임이 횡하중/비틀림을 분담하는 하이브리드(복합) 구조.',
                      },
                      {
                        title: '2) 비틀림 형상 대응 설계',
                        desc: '5개 페탈(petal)이 회전하며 상승하는 형상으로 비틀림 응답이 커질 수 있어 코어·외곽 프레임 결합으로 제어.',
                      },
                      {
                        title: '3) 초고강도 콘크리트 적용',
                        desc: '고강도 콘크리트와 혹한 시공(양생/배합)을 통해 강성·내구성·시공성을 확보.',
                      },
                      {
                        title: '4) 매트 + 말뚝(Piled Raft) 기초',
                        desc: '두꺼운 매트 기초와 다수 말뚝을 결합해 연약지반에서 침하/차등침하를 제어.',
                      },
                      {
                        title: '5) 첨탑(Spire) 안정성 설계',
                        desc: '비거주 첨탑은 자중 최소화와 풍진동 억제가 중심(철골/트러스 + 감쇠 설계).',
                      },
                      {
                        title: '6) 성능기반 설계',
                        desc: '강풍·진동·혹한 시나리오를 고려해 풍동실험과 해석을 병행하고 사용성 기준을 엄격히 적용.',
                      },
                    ].map((item, index) => (
                      <article
                        key={index}
                        className="border border-black/12 rounded-[18px] p-[18px] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]"
                      >
                        <h3 className="m-[0_0_10px] text-[16px] font-bold">{item.title}</h3>
                        <p className="m-0 leading-[1.7] opacity-90">{item.desc}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <section id="lakhta-gallery" className="p-[40px_16px] text-center mt-[50px]">
                <h2 className="mb-5 text-[28px] font-bold text-[#1e3a5f]">라흐타 타워 전경 및 시공 사진</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 items-stretch">
                  <Image
                    src="/images/Shimizu/lahta-1.png"
                    alt="라흐타 타워 도시 전경"
                    width={600}
                    height={380}
                    className="w-full h-[380px] object-contain mx-auto bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                  />
                  <Image
                    src="/images/Shimizu/lakhta-0.png"
                    alt="라흐타 타워 전경"
                    width={600}
                    height={380}
                    className="w-full h-[380px] object-contain mx-auto bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                  />
                </div>

                <div className="mt-[30px] text-center">
                  <a
                    href="https://global.ctbuh.org/resources/papers/download/4376-the-structural-engineering-design-and-construction-of-the-tallest-building-in-europe-lakhta-center-st-peters.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block p-[12px_24px] bg-[#1e3a5f] text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:bg-[#2d5a87]"
                  >
                    📄 라흐타 센터 구조 설계 및 시공 논문 다운로드 (PDF)
                  </a>
                </div>
              </section>
            </div>
          </section>

          <section
            id="factory-photos"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                7. 공장 사진
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 강재 기둥이 적용된 공장 건물의 실제 사진을 확인하실 수 있습니다. <strong>장경간 내부공간</strong>이
                필요한 공장기둥에{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 강재 기둥이 효과적으로 활용되고 있습니다.
              </p>
            </div>

            <div className="mt-[60px] pt-[40px] border-t-2 border-[#e2e8f0]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] mt-[30px]">
                {[
                  { src: '/images/Shimizu/factory-1.jpg', title: '공장 사진 1' },
                  { src: '/images/Shimizu/factory-2.png', title: '공장 사진 2' },
                  { src: '/images/Shimizu/factory-3.jpg', title: '공장 사진 3' },
                  { src: '/images/Shimizu/factory-4.jpg', title: '공장 사진 4' },
                  { src: '/images/Shimizu/factory-5.jpg', title: '공장 사진 5' },
                  { src: '/images/Shimizu/factory-6.jpg', title: '공장 사진 6' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#f7fafc] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#e2e8f0] hover:-translate-y-[5px] hover:shadow-[0_8px_24px_rgba(102,126,234,0.2)] hover:border-[#667eea]"
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="w-full h-[400px] object-contain block bg-gradient-to-br from-[#f8fafc] to-white p-[10px]"
                    />
                    <div className="p-5 text-center text-[18px] font-semibold text-[#2d3748]">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="temporary-construction"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                8. 가설건축공사
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                가설건축공사는{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 강재 기둥을 활용한 임시 구조물 및 가설 건축물에 적용되는 공법입니다. <strong>빠른 시공</strong>과{' '}
                <strong>효율적인 구조 설계</strong>를 통해 공사 기간을 단축하고 안정적인 구조 성능을 제공합니다.
              </p>
            </div>

            <div className="mt-[60px] pt-[40px] border-t-2 border-[#e2e8f0]">
              <h3 className="text-[28.8px] font-bold text-[#2d3748] mb-[30px] text-center border-b-[3px] border-[#667eea] pb-[15px]">
                🏗️ 가설건축공사 사진
              </h3>
              <div className="grid grid-cols-1 gap-[30px] mt-[30px]">
                {[
                  { src: '/images/Shimizu/temporary-2.png', title: '가설건축공사 사진 1' },
                  { src: '/images/Shimizu/temp.png', title: '가설건축공사 사진 3' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#f7fafc] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#e2e8f0] hover:-translate-y-[5px] hover:shadow-[0_8px_24px_rgba(102,126,234,0.2)] hover:border-[#667eea]"
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={1200}
                      height={800}
                      className="w-full h-[800px] object-contain block bg-gradient-to-br from-[#f8fafc] to-white p-[10px]"
                    />
                    <div className="p-5 text-center text-[18px] font-semibold text-[#2d3748]">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="cross-h-structural-features"
            className="mb-20 scroll-mt-5 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-[30px]">
              <h2 className="text-[35.1px] font-bold text-[#1e3a5f] mb-[30px] pb-5 border-b-4 border-image-linear-to-r from-[#667eea] to-[#764ba2] relative flex items-center gap-[15px] before:content-[''] before:w-[6px] before:h-[40px] before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:rounded-[3px]">
                9. Cross H 구조적 특징 및 장점과 CFT 비교
              </h2>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <p className="mb-[18px] pl-[10px]">
                Cross H형 강재 기둥의 구조적 특징을 분석하고, CFT(Concrete Filled Tube) 기둥과 비교하여 각 공법의
                특성과 적용 범위를 명확히 파악할 수 있습니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] border-l-[6px] border-[#667eea] p-[30px] rounded-2xl m-[30px_0] shadow-[0_4px_16px_rgba(102,126,234,0.15)] relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-right-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(102,126,234,0.1)_0%,transparent_70%)] before:pointer-events-none">
              <strong className="text-[22.88px] text-[#1e3a5f] block mb-[15px] relative z-10">
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>{' '}
                구조적 특징
              </strong>
              <p className="text-[20.8px] leading-[1.8] text-[#4a5568] m-0 relative z-10">
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>
                형 단면의 구조설계시 일반 H형강과 동일하고 X방향과 Y방향의 단면 2차모멘트가 증가하므로 장주에
                효과적이다. 특히 좌굴길이와 좌굴 안정성은 각 방향이 동일하므로 설계가 용이합니다.
              </p>
            </div>

            <div className="text-[20.8px] leading-[1.9] text-[#4a5568] mb-[25px]">
              <h3 className="text-[28.08px] font-bold text-[#2d5a87] mb-5 p-[15px_20px] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] rounded-xl border-l-4 border-[#667eea]">
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>{' '}
                기둥의 시공적 장점
              </h3>
              <ul className="list-none ml-5 mb-[25px] pl-5">
                {[
                  {
                    title: 'TOP-DOWN공법 적용 가능:',
                    desc: '타설 콘크리트가 없어 TOP-DOWN 공법에 최적화되어 있습니다.',
                  },
                  {
                    title: '공기 단축:',
                    desc: '볼트 체결 방식으로 현장 용접 대비 공기 단축이 가능합니다.',
                  },
                  {
                    title: '품질 관리 용이:',
                    desc: '공장 제작으로 품질이 일정하고, 콘크리트 타설이 없어 품질 관리가 용이합니다.',
                  },
                  {
                    title: '동절기 공사 우수:',
                    desc: '콘크리트 타설이 필요 없어 동절기 공사에 유리합니다.',
                  },
                  {
                    title: '전문기술자 불필요:',
                    desc: '현장볼트체결 및 설치작업에는 용접과 같은 전문기술자가 불필요하여 현장의 인력수급에 장점이 있다.',
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="relative pl-[35px] mb-[15px] leading-[1.8] before:content-['✓'] before:absolute before:left-0 before:top-0 before:w-6 before:h-6 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:text-white before:rounded-full before:flex before:items-center before:justify-center before:text-sm before:font-bold"
                  >
                    <strong className="text-[#1e3a5f] font-bold bg-gradient-to-br from-[#f0f4ff] to-transparent p-[2px_6px] rounded">
                      {item.title}
                    </strong>{' '}
                    {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="m-[30px_0] p-[30px] bg-gradient-to-br from-[#f8fafc] to-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] border-2 border-[#e2e8f0]">
              <h3 className="mb-[25px] p-[20px] bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white rounded-xl text-center text-[26px] shadow-[0_4px_12px_rgba(30,58,95,0.3)]">
                ⚖️{' '}
                <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                  Cross H
                </span>{' '}
                vs CFT 비교
              </h3>
              <table className="w-full border-collapse border-spacing-0 m-[30px_0] text-[20.8px] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] table-fixed">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white p-[18px_20px] text-left font-bold uppercase tracking-[0.5px] text-[19.2px] relative w-1/4 rounded-tl-xl">
                      📋 항목
                    </th>
                    <th className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-[18px_20px] text-left font-bold uppercase tracking-[0.5px] text-[19.2px] relative w-[37.5%]">
                      🏗️{' '}
                      <span className="text-[#92400e] font-bold bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] p-[2px_6px] rounded inline-block shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                        Cross H
                      </span>
                    </th>
                    <th className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white p-[18px_20px] text-left font-bold uppercase tracking-[0.5px] text-[19.2px] relative w-[37.5%] rounded-tr-xl">
                      🏢 CFT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      item: '구조 성능',
                      crossH: '✅ X, Y방향 동일한 성능',
                      cft: '원형/사각형 단면',
                    },
                    {
                      item: '시공 방법',
                      crossH: '✅ 볼트체결(저비용)',
                      cft: '⚠️ 현장용접이음(고비용)',
                    },
                    {
                      item: '콘크리트 타설',
                      crossH: '✅ 불필요',
                      cft: '⚠️ 필요',
                    },
                    {
                      item: '공기',
                      crossH: '✅ 단축 가능',
                      cft: '⚠️ 콘크리트 양생 시간 필요',
                    },
                    {
                      item: '서비스 홀 시공',
                      crossH: '✅ 무타설로 불필요',
                      cft: '⚠️ CFT내채움 콘크리트로 필요',
                    },
                    {
                      item: '부력방지',
                      crossH: '✅ 선단부 오픈으로 불필요',
                      cft: '⚠️ 부력방지대책필요',
                    },
                    {
                      item: '동절기 공사',
                      crossH: '✅ 우수',
                      cft: '⚠️ 콘크리트 타설 제약',
                    },
                    {
                      item: '품질 관리',
                      crossH: '✅ 공장 제작으로 일정',
                      cft: '⚠️ 공장제작 및 현장 콘크리트 타설 품질 관리 필요',
                    },
                    {
                      item: '제작비용',
                      crossH: '⚠️ 접합부 형태에 따라 고비용 발생',
                      cft: '⚠️ 접합부 제작-고비용',
                    },
                    {
                      item: 'TOP-DOWN 공법',
                      crossH: '✅ 본설 + 가설기둥 적용',
                      cft: '⚠️ 제한적(가설기둥 적용 불가)',
                    },
                  ].map((row, index, arr) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                      <td
                        className={`p-5 border-b border-[#e2e8f0] text-[#4a5568] text-[20.8px] transition-all duration-200 align-middle bg-gradient-to-br from-[#f8fafc] to-white font-semibold text-[#1e3a5f] w-1/4 ${
                          index === arr.length - 1 ? 'rounded-bl-xl' : ''
                        }`}
                      >
                        <strong className="text-[#1e3a5f] font-bold inline-block p-[4px_8px] bg-[rgba(30,58,95,0.1)] rounded-md">
                          {row.item}
                        </strong>
                      </td>
                      <td className="p-5 border-b border-[#e2e8f0] text-[#4a5568] text-[20.8px] transition-all duration-200 align-middle bg-gradient-to-br from-[#f0f4ff] to-white border-l-[3px] border-[#667eea] w-[37.5%] hover:translate-x-[2px]">
                        {row.crossH}
                      </td>
                      <td
                        className={`p-5 border-b border-[#e2e8f0] text-[#4a5568] text-[20.8px] transition-all duration-200 align-middle bg-gradient-to-br from-[#fef3c7] to-white border-l-[3px] border-[#f59e0b] w-[37.5%] hover:translate-x-[2px] ${
                          index === arr.length - 1 ? 'rounded-br-xl' : ''
                        }`}
                      >
                        {row.cft}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
