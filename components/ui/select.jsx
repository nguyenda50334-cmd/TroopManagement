import React, { useState } from "react";

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const triggerChild = React.Children.toArray(children).find(
    child => child.type === SelectTrigger
  );
  const contentChild = React.Children.toArray(children).find(
    child => child.type === SelectContent
  );

  // Find the label for the current value from SelectItems
  const items = contentChild ? React.Children.toArray(contentChild.props.children) : [];
  const selectedItem = items.find(item => item.props.value === value);
  const displayValue = selectedItem ? selectedItem.props.children : value;

  return (
    <div className="relative">
      {triggerChild && React.cloneElement(triggerChild, {
        isOpen,
        setIsOpen,
        displayValue
      })}
      {isOpen && contentChild && React.cloneElement(contentChild, {
        onValueChange: (val) => {
          onValueChange(val);
          setIsOpen(false);
        },
        onClose: () => setIsOpen(false)
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = "", isOpen, setIsOpen, displayValue }) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${className}`}
    >
      <span className="text-slate-700">{displayValue}</span>
      <svg 
        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder }) {
  return null; // This is just a placeholder component
}

export function SelectContent({ children, onValueChange, onClose }) {
  return (
    <>
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
      <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
        {React.Children.map(children, child =>
          React.cloneElement(child, { onValueChange })
        )}
      </div>
    </>
  );
}

export function SelectItem({ value, children, onValueChange }) {
  return (
    <div
      onClick={() => onValueChange(value)}
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-slate-700 transition-colors"
    >
      {children}
    </div>
  );
}