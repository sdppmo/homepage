const RightSidebar = () => {
  const newsItems = [
    {
      title: 'K-COL Steel Column',
      content: 'Program is release on 1 of Dec. New Auto Find Section to be loaded on 1 of Feb.',
      isNew: true,
    },
    {
      title: 'Slimbox Tests',
      content: 'Tests on 1 of Jan with POSCO Global R&D Center at Songdo, Incheon',
      isNew: false,
    },
    {
      title: 'H Beam Price Update',
      content: 'Price up 50won/kg on Nov. from Hyundai-steel',
      isNew: false,
    },
    {
      title: 'K-COL 실시공',
      content: '현장 OPEN',
      isNew: false,
    },
  ];

  return (
    <aside className="relative w-full p-4 z-20 overflow-y-auto overflow-x-hidden pointer-events-auto bg-slate-900/95 backdrop-blur-sm order-3 md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[280px] md:bg-slate-900/80 md:flex md:flex-col md:order-none lg:w-[260px] lg:p-3">
      <div className="mt-4 flex-1 lg:mt-[80px]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-600"></div>
          <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            NEWS
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-600"></div>
        </div>
        
        <div className="space-y-3">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-slate-800/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
            >
              {item.isNew && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  NEW
                </span>
              )}
              <h3 className="text-sm font-semibold text-blue-400 mb-1 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
