export function Badge({ children, className = "" }) {
  return <span className={`px-2 py-1 rounded-full text-xs ${className}`}>{children}</span>;
}
