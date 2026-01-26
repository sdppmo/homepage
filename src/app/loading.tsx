export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-3 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}
