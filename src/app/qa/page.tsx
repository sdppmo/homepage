'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Question {
  id: number;
  userName: string;
  userEmail: string;
  questionText: string;
  date: string;
  answered: boolean;
  answer: string | null;
}

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    const storedQuestions = localStorage.getItem('qaQuestions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userEmail || !questionText) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const newQuestion: Question = {
      id: Date.now(),
      userName,
      userEmail,
      questionText,
      date: new Date().toISOString(),
      answered: false,
      answer: null,
    };

    const updatedQuestions = [newQuestion, ...questions];
    setQuestions(updatedQuestions);
    localStorage.setItem('qaQuestions', JSON.stringify(updatedQuestions));

    setUserName('');
    setUserEmail('');
    setQuestionText('');
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 5000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-16 px-5 relative overflow-auto">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            ❓ Q & A (logged-in user)
          </h1>
          <p className="text-2xl md:text-3xl opacity-95 font-normal drop-shadow-md mb-5">로그인 사용자 질문과 답변</p>
          <p className="text-lg md:text-xl opacity-90 max-w-[800px] mx-auto leading-relaxed">
            본 패널은 user들의 기능이해를 돕기위해 질문과 답변을 활용할 수 있도록 세팅합니다.
          </p>
          <Link href="/" className="inline-block mt-6 py-3 px-7 bg-white/15 backdrop-blur-md text-white rounded-xl transition-all duration-300 border-2 border-white/30 font-semibold shadow-lg hover:bg-white/25 hover:-translate-y-1 hover:shadow-xl">
            🏠 홈으로 돌아가기
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">질문 제출하기</h2>
          {successMessage && (
            <div className="bg-[#d1fae5] text-[#065f46] p-4 rounded-lg mb-5 border-l-4 border-[#10b981] font-semibold">
              질문이 성공적으로 제출되었습니다! 답변을 기다려주세요.
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-[#f8fafc] rounded-xl p-8 mb-8 border-2 border-[#e2e8f0]">
            <div className="mb-5">
              <label htmlFor="userName" className="block font-semibold text-[#1e3a5f] mb-2 text-base">이름 *</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="이름을 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="userEmail" className="block font-semibold text-[#1e3a5f] mb-2 text-base">이메일 *</label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                placeholder="이메일을 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="questionText" className="block font-semibold text-[#1e3a5f] mb-2 text-base">질문 내용 *</label>
              <textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                placeholder="질문을 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] min-h-[120px] resize-y"
              ></textarea>
            </div>
            <button type="submit" className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3.5 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
              질문 제출하기
            </button>
          </form>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">기존 질문 목록</h2>
          <div className="mt-10">
            <div className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex-1">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">김철강</div>
                  <div className="text-sm text-[#718096]">2024년 12월 15일 오후 2:30</div>
                </div>
                <div className="py-1.5 px-3 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                  ✓ 답변 완료
                </div>
              </div>
              <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">K-COL 시스템에서 Cross H형 단면을 수동으로 입력할 수 있나요?</div>
              <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">네, 가능합니다. Auto Find Section 외에도 수동으로 단면을 입력하고 계산할 수 있습니다. 계산기 페이지에서 직접 단면 치수를 입력하시면 됩니다.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex-1">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">이건설</div>
                  <div className="text-sm text-[#718096]">2024년 12월 10일 오전 10:15</div>
                </div>
                <div className="py-1.5 px-3 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                  ✓ 답변 완료
                </div>
              </div>
              <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">BOQ 보고서를 엑셀로 내보낼 수 있나요?</div>
              <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">현재는 웹에서 보고서를 확인할 수 있으며, 엑셀 내보내기 기능은 개발 중입니다. 곧 제공될 예정입니다.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex-1">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">박공사</div>
                  <div className="text-sm text-[#718096]">2024년 12월 5일 오후 4:20</div>
                </div>
                <div className="py-1.5 px-3 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                  ✓ 답변 완료
                </div>
              </div>
              <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">기둥 면적배분 알고리즘에서 불필요한 기둥을 자동으로 삭제해주나요?</div>
              <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">네, 기둥 면적배분 자동산정 알고리즘은 면적분배의 적정성을 검토하여 불필요한 기둥을 자동으로 식별하고 삭제 또는 기둥간격 조정을 제안합니다. 최종 결정은 사용자가 할 수 있습니다.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex-1">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">최설계</div>
                  <div className="text-sm text-[#718096]">2024년 11월 28일 오전 9:45</div>
                </div>
                <div className="py-1.5 px-3 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                  ✓ 답변 완료
                </div>
              </div>
              <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">공정관리 시스템에서 여러 프로젝트를 동시에 관리할 수 있나요?</div>
              <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">네, 가능합니다. 프로젝트 선택 모달에서 여러 프로젝트를 생성하고 관리할 수 있으며, 각 프로젝트별로 공정 데이터가 분리되어 저장됩니다.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex-1">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">정현장</div>
                  <div className="text-sm text-[#718096]">2024년 11월 20일 오후 3:10</div>
                </div>
                <div className="py-1.5 px-3 rounded-full text-sm font-semibold bg-[#d1fae5] text-[#065f46]">
                  ✓ 답변 완료
                </div>
              </div>
              <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">현장기둥설치 Mapping 기능은 어떻게 사용하나요?</div>
              <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">현장기둥설치 Mapping은 현장에서 기둥 설치 위치를 지도에 표시하고 관리하는 기능입니다. K-COL 기능 설명서의 "현장기둥설치 Mapping" 섹션을 참고하시기 바랍니다.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30" id="submittedQuestions">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">제출된 질문</h2>
          <div className="mt-10">
            {questions.length === 0 ? (
              <div className="text-center py-16 px-5 text-[#718096] text-lg bg-[#f8fafc] rounded-xl border-2 border-dashed border-[#cbd5e0]">
                아직 제출된 질문이 없습니다. 위의 폼을 사용하여 질문을 제출해주세요.
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-[#1e3a5f] text-lg mb-1">{q.userName}</div>
                      <div className="text-sm text-[#718096]">{formatDate(q.date)}</div>
                    </div>
                    <div className={`py-1.5 px-3 rounded-full text-sm font-semibold ${q.answered ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                      {q.answered ? '✓ 답변 완료' : '⏳ 답변 대기'}
                    </div>
                  </div>
                  <div className="text-base text-[#2d3748] leading-relaxed mb-4 p-4 bg-[#f8fafc] rounded-lg">{q.questionText}</div>
                  {q.answer && (
                    <div className="mt-5 pt-5 border-t-2 border-[#e2e8f0]">
                      <div className="font-bold text-[#667eea] mb-2 text-base">답변:</div>
                      <div className="text-base text-[#4a5568] leading-relaxed p-4 bg-[#f0f4ff] rounded-lg border-l-4 border-[#667eea]">{q.answer}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">자주 묻는 질문</h2>
          <div className="mt-10">
            <div className="bg-[#f8fafc] rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] transition-all duration-300 hover:bg-[#f1f5f9] hover:translate-x-1 hover:shadow-md">
              <div className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2 before:content-['❓'] before:text-2xl">K-COL 시스템은 어떻게 사용하나요?</div>
              <div className="text-base text-[#4a5568] leading-relaxed pl-9 before:content-['💡'] before:mr-2">
                K-COL Web Software 메뉴에서 Cross H형 강재 기둥 설계를 시작할 수 있습니다.
                자세한 사용 방법은 K-COL 기능 설명서를 참고하세요.
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] transition-all duration-300 hover:bg-[#f1f5f9] hover:translate-x-1 hover:shadow-md">
              <div className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2 before:content-['❓'] before:text-2xl">Auto Find Section 기능은 무엇인가요?</div>
              <div className="text-base text-[#4a5568] leading-relaxed pl-9 before:content-['💡'] before:mr-2">
                Auto Find Section은 입력된 하중 조건에 따라 최적의 Cross H형 단면을 자동으로 찾아주는 기능입니다.
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] transition-all duration-300 hover:bg-[#f1f5f9] hover:translate-x-1 hover:shadow-md">
              <div className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2 before:content-['❓'] before:text-2xl">BOQ 보고서는 어떻게 생성하나요?</div>
              <div className="text-base text-[#4a5568] leading-relaxed pl-9 before:content-['💡'] before:mr-2">
                Auto Find Section을 수행한 후, BOQ Report 메뉴로 이동하여 프로젝트 정보를 입력하고 물량을 산출할 수 있습니다.
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] transition-all duration-300 hover:bg-[#f1f5f9] hover:translate-x-1 hover:shadow-md">
              <div className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2 before:content-['❓'] before:text-2xl">기둥 면적배분 자동산정 알고리즘은 무엇인가요?</div>
              <div className="text-base text-[#4a5568] leading-relaxed pl-9 before:content-['💡'] before:mr-2">
                기둥당 면적분배를 자동으로 계산하고 면적분배의 적정성을 검토하여 불필요한 기둥을 삭제하거나 기둥간격을 조정할 수 있는 기능입니다.
                특히 탑다운 기둥 Naming 및 Grouping에 유효한 기능입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
