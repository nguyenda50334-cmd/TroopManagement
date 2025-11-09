export function Checkbox({ checked = false, onChange, className }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange?.(e.target.checked)}
      className={`h-4 w-4 text-blue-600 border-gray-300 rounded ${className || ""}`}
    />
  );
}
