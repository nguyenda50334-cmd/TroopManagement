import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
      {...props}
    />
  );
}