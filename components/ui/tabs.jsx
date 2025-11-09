export function Tabs({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function TabsList({ children, className = "" }) {
  return <div className={`flex gap-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({ children, className = "", ...props }) {
  return <button className={`px-3 py-1 rounded ${className}`} {...props}>{children}</button>;
}
