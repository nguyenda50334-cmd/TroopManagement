import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative z-50 w-full animate-scaleIn">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-2xl mx-auto p-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-2xl font-bold text-slate-900 ${className}`}>
      {children}
    </h2>
  );
}