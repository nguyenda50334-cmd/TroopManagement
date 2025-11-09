import React from "react";

export function SidebarProvider({ children }) {
  return <div className="flex">{children}</div>;
}

export function Sidebar({ children, className = "" }) {
  return (
    <aside className={`w-64 flex-shrink-0 ${className}`}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarFooter({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroup({ children }) {
  return <div>{children}</div>;
}

export function SidebarGroupLabel({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroupContent({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenu({ children }) {
  return <nav>{children}</nav>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, asChild, className = "" }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${children.props.className || ""} ${className}`.trim()
    });
  }
  return <button className={className}>{children}</button>;
}

export function SidebarTrigger({ className = "" }) {
  return (
    <button className={className}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}