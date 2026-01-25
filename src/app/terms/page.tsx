import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 - SongDoPartners',
  description: '송도파트너스피엠오 서비스 이용약관',
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">이용약관</h1>
          <p className="text-slate-400 text-sm mb-8">최종 수정일: 2026년 1월 25일</p>

          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제1조 (목적)</h2>
              <p className="text-slate-300 leading-relaxed">
                본 약관은 주식회사 송도파트너스피엠오(이하 &quot;회사&quot;)가 제공하는 K-COL 철골기둥 설계 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제2조 (정의)</h2>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li>&quot;서비스&quot;란 회사가 제공하는 K-COL 웹 소프트웨어 및 관련 서비스를 의미합니다.</li>
                <li>&quot;회원&quot;이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.</li>
                <li>&quot;아이디(ID)&quot;란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인한 이메일 주소를 의미합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제3조 (약관의 효력 및 변경)</h2>
              <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</li>
                <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                <li>약관이 변경되는 경우 회사는 변경 내용을 서비스 내 공지사항을 통해 공지합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제4조 (서비스의 제공)</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li>K-COL Cross H형 강재 기둥 설계 계산 서비스</li>
                <li>Auto Find Section (최적 단면 자동 탐색) 서비스</li>
                <li>BOQ Report (물량 산출) 서비스</li>
                <li>공정 관리 시스템</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제5조 (회원가입)</h2>
              <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                <li>서비스 이용을 원하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                <li>회사는 회원가입 신청자가 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                  <ul className="mt-2 ml-4 space-y-1 list-disc list-inside">
                    <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제6조 (회원의 의무)</h2>
              <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                <li>회원은 서비스 이용 시 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.</li>
                <li>회원은 자신의 아이디 및 비밀번호를 관리할 책임이 있으며, 이를 제3자에게 이용하게 해서는 안 됩니다.</li>
                <li>회원은 서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등의 방법으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제7조 (서비스 이용의 제한)</h2>
              <p className="text-slate-300 leading-relaxed">
                회사는 회원이 다음 각 호에 해당하는 행위를 하는 경우 서비스 이용을 제한하거나 회원자격을 상실시킬 수 있습니다:
              </p>
              <ul className="text-slate-300 space-y-2 list-disc list-inside mt-4">
                <li>타인의 정보를 도용한 경우</li>
                <li>서비스 운영을 고의로 방해한 경우</li>
                <li>회원이 국익 또는 사회적 공익을 저해할 목적으로 서비스를 이용한 경우</li>
                <li>기타 관련 법령이나 회사가 정한 이용조건에 위배되는 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제8조 (면책조항)</h2>
              <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
                <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
                <li>서비스를 통해 제공되는 계산 결과는 참고용이며, 실제 설계 및 시공에 적용 시 전문 엔지니어의 검토가 필요합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">제9조 (분쟁해결)</h2>
              <p className="text-slate-300 leading-relaxed">
                본 약관에 명시되지 않은 사항은 관계 법령 및 상관례에 따르며, 서비스 이용과 관련하여 분쟁이 발생한 경우 회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">부칙</h2>
              <p className="text-slate-300 leading-relaxed">
                본 약관은 2026년 1월 25일부터 시행합니다.
              </p>
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
