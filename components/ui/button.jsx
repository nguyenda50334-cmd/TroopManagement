export function Button({ children, className = "", size = "md", variant = "default", ...props }) {
  const sizeClasses = size === "sm" ? "px-2 py-1 text-sm" : "px-4 py-2 text-md";
  const variantClasses =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700"
      : "bg-blue-600 text-white";

  return (
    <button className={`${sizeClasses} ${variantClasses} rounded ${className}`} {...props}>
      {children}
    </button>
  );
}
