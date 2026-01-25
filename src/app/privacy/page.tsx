import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - SongDoPartners',
  description: '송도파트너스피엠오 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-2">개인정보처리방침</h1>
          <p className="text-slate-400 text-sm mb-8">최종 수정일: 2026년 1월 25일</p>

          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. 개인정보의 처리 목적</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                주식회사 송도파트너스피엠오(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 등</li>
                <li><strong>서비스 제공:</strong> K-COL 웹 소프트웨어 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공 등</li>
                <li><strong>고충처리:</strong> 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 등</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. 수집하는 개인정보 항목</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-white mb-2">필수 항목</h3>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-white mb-2">선택 항목</h3>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>회사명/소속</li>
                  <li>연락처</li>
                  <li>이름</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">자동 수집 항목</h3>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>접속 IP 주소</li>
                  <li>접속 일시</li>
                  <li>서비스 이용 기록</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. 개인정보의 처리 및 보유 기간</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간까지)</li>
                <li><strong>서비스 이용 기록:</strong> 3년</li>
                <li><strong>접속 로그:</strong> 3개월</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-slate-300 leading-relaxed">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. 개인정보의 파기</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>전자적 파일:</strong> 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
                <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                위 권리 행사는 서면, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. 개인정보의 안전성 확보조치</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">8. 개인정보 보호책임자</h2>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <ul className="text-slate-300 space-y-2">
                  <li><strong>성명:</strong> 김호성</li>
                  <li><strong>직책:</strong> 대표이사</li>
                  <li><strong>연락처:</strong> sbd_pmo@naver.com</li>
                </ul>
              </div>
              <p className="text-slate-300 leading-relaxed mt-4">
                정보주체는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">9. 개인정보 처리방침 변경</h2>
              <p className="text-slate-300 leading-relaxed">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. 권익침해 구제방법</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            주식회사 송도파트너스피엠오 | 인천광역시 연수구 컨벤시아대로 42번길 77번지
          </p>
          <p className="text-slate-500 text-sm mt-1">
            문의: <a href="mailto:sbd_pmo@naver.com" className="text-slate-400 hover:text-white">sbd_pmo@naver.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
