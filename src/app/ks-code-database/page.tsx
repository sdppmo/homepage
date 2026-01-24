'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface KSCode {
  id: number;
  number: string;
  title: string;
  description: string;
  category: string;
}

interface KSCodeRequest {
  id: number;
  userName: string;
  userEmail: string;
  ksCodeNumber: string;
  description: string;
  date: string;
}

const exampleKSCodes: KSCode[] = [
  {
    id: 1,
    number: 'KS D 3502',
    title: '일반구조용 압연강재',
    description: '건축 및 구조물에 사용되는 일반구조용 압연강재의 규격 및 품질 기준을 정의합니다.',
    category: '철강',
  },
  {
    id: 2,
    number: 'KS D 3503',
    title: '용접구조용 압연강재',
    description: '용접 구조물에 사용되는 압연강재의 규격 및 품질 기준을 정의합니다.',
    category: '철강',
  },
  {
    id: 3,
    number: 'KS D 3504',
    title: 'H형강',
    description: 'H형강의 치수, 형상, 질량 및 허용차에 대한 규격을 정의합니다.',
    category: '철강',
  },
  {
    id: 4,
    number: 'KS D 3505',
    title: '각형강관',
    description: '각형강관의 치수, 형상, 질량 및 허용차에 대한 규격을 정의합니다.',
    category: '철강',
  },
  {
    id: 5,
    number: 'KS D 3506',
    title: '원형강관',
    description: '원형강관의 치수, 형상, 질량 및 허용차에 대한 규격을 정의합니다.',
    category: '철강',
  },
];

export default function KSCodeDatabasePage() {
  const [ksCodes, setKSCodes] = useState<KSCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCodes, setFilteredCodes] = useState<KSCode[]>([]);
  const [requestUserName, setRequestUserName] = useState('');
  const [requestUserEmail, setRequestUserEmail] = useState('');
  const [ksCodeNumber, setKsCodeNumber] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestSuccessMessage, setRequestSuccessMessage] = useState(false);

  useEffect(() => {
    const storedCodes = localStorage.getItem('ksCodes');
    if (storedCodes) {
      setKSCodes(JSON.parse(storedCodes));
    } else {
      localStorage.setItem('ksCodes', JSON.stringify(exampleKSCodes));
      setKSCodes(exampleKSCodes);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredCodes(
        ksCodes.filter(
          (code) =>
            code.number.toLowerCase().includes(term) ||
            code.title.toLowerCase().includes(term) ||
            code.description.toLowerCase().includes(term) ||
            code.category.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredCodes(ksCodes);
    }
  }, [searchTerm, ksCodes]);

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const viewKSCode = (codeNumber: string) => {
    alert(`KS 코드 ${codeNumber}의 상세 내용을 보여줍니다.\n\n(실제 구현 시 PDF 파일이나 상세 페이지로 연결됩니다.)`);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestUserName || !requestUserEmail || !ksCodeNumber) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newRequest: KSCodeRequest = {
      id: Date.now(),
      userName: requestUserName,
      userEmail: requestUserEmail,
      ksCodeNumber,
      description: requestDescription,
      date: new Date().toISOString(),
    };

    const storedRequests = localStorage.getItem('ksCodeRequests');
    const requests = storedRequests ? JSON.parse(storedRequests) : [];
    requests.unshift(newRequest);
    localStorage.setItem('ksCodeRequests', JSON.stringify(requests));

    setRequestUserName('');
    setRequestUserEmail('');
    setKsCodeNumber('');
    setRequestDescription('');
    setRequestSuccessMessage(true);

    setTimeout(() => {
      setRequestSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-16 px-5 relative overflow-auto">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            📚 KS code DB(철골용)
          </h1>
          <p className="text-2xl md:text-3xl opacity-95 font-normal drop-shadow-md mb-5">한국산업표준 코드 데이터베이스</p>
          <p className="text-lg md:text-xl opacity-90 max-w-[800px] mx-auto leading-relaxed">
            본 패널은 KS코드를 바로바로 볼 수 있도록 제공합니다. 패널을 열면 User들의 요구에 따라 해당 KS코드를 올립니다.
          </p>
          <Link href="/" className="inline-block mt-6 py-3 px-7 bg-white/15 backdrop-blur-md text-white rounded-xl transition-all duration-300 border-2 border-white/30 font-semibold shadow-lg hover:bg-white/25 hover:-translate-y-1 hover:shadow-xl">
            🏠 홈으로 돌아가기
          </Link>
        </div>

        {/* KS 코드 검색 */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">KS 코드 검색</h2>
          <div className="bg-[#f8fafc] rounded-xl p-8 mb-8 border-2 border-[#e2e8f0]">
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <input
                type="text"
                id="searchInput"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="KS 코드 번호 또는 키워드를 입력하세요 (예: KS D 3502, 철강)"
                className="flex-1 p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                검색
              </button>
            </div>
            <div className="text-sm text-[#718096] mt-2">
              💡 예시: "KS D 3502", "철강", "H형강", "용접" 등으로 검색할 수 있습니다.
            </div>
          </div>
        </div>

        {/* KS 코드 요청 */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">KS 코드 요청</h2>
          {requestSuccessMessage && (
            <div className="bg-[#d1fae5] text-[#065f46] p-4 rounded-lg mb-5 border-l-4 border-[#10b981] font-semibold">
              KS 코드 요청이 성공적으로 제출되었습니다! 검토 후 업로드하겠습니다.
            </div>
          )}
          <form onSubmit={handleRequestSubmit} className="bg-[#f8fafc] rounded-xl p-8 mb-8 border-2 border-[#e2e8f0]">
            <div className="mb-5">
              <label htmlFor="requestUserName" className="block font-semibold text-[#1e3a5f] mb-2 text-base">이름 *</label>
              <input
                type="text"
                id="requestUserName"
                value={requestUserName}
                onChange={(e) => setRequestUserName(e.target.value)}
                required
                placeholder="이름을 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="requestUserEmail" className="block font-semibold text-[#1e3a5f] mb-2 text-base">이메일 *</label>
              <input
                type="email"
                id="requestUserEmail"
                value={requestUserEmail}
                onChange={(e) => setRequestUserEmail(e.target.value)}
                required
                placeholder="이메일을 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="ksCodeNumber" className="block font-semibold text-[#1e3a5f] mb-2 text-base">요청할 KS 코드 번호 *</label>
              <input
                type="text"
                id="ksCodeNumber"
                value={ksCodeNumber}
                onChange={(e) => setKsCodeNumber(e.target.value)}
                required
                placeholder="예: KS D 3502"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="requestDescription" className="block font-semibold text-[#1e3a5f] mb-2 text-base">요청 사유 또는 설명</label>
              <textarea
                id="requestDescription"
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="해당 KS 코드가 필요한 이유나 용도를 입력하세요"
                className="w-full p-3 border-2 border-[#cbd5e0] rounded-lg text-base transition-colors duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] min-h-[100px] resize-y"
              ></textarea>
            </div>
            <button type="submit" className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3.5 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
              KS 코드 요청하기
            </button>
          </form>
        </div>

        {/* KS 코드 목록 */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-8 pb-4 border-b-4 border-[#667eea]">KS 코드 목록</h2>
          <div className="mt-10">
            {filteredCodes.length === 0 ? (
              <div className="text-center py-16 px-5 text-[#718096] text-lg bg-[#f8fafc] rounded-xl border-2 border-dashed border-[#cbd5e0]">
                검색 결과가 없습니다. 다른 키워드로 검색해보세요.
              </div>
            ) : (
              filteredCodes.map((code) => (
                <div key={code.id} className="bg-white rounded-xl p-6 mb-5 border-l-[5px] border-[#667eea] shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-md">
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xl font-bold text-[#1e3a5f]">{code.title}</div>
                      <div className="text-base text-[#667eea] font-semibold">{code.number}</div>
                    </div>
                  </div>
                  <div className="text-base text-[#4a5568] leading-relaxed mb-4">{code.description}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewKSCode(code.number)}
                      className="bg-[#667eea] text-white border-none py-2 px-4 text-sm font-semibold rounded-md cursor-pointer transition-all duration-300 hover:bg-[#5568d3] hover:-translate-y-0.5"
                    >
                      코드 보기
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
