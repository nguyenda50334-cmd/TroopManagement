export function Progress({ value = 0, className = "" }) {
  return (
    <div className={`w-full h-2 bg-slate-100 rounded ${className}`}>
      <div className="h-full bg-blue-600 rounded" style={{ width: `${value}%` }} />
    </div>
  );
}
