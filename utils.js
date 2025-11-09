// utils.js

/**
 * Creates a URL path for a given page name
 * Example: "Dashboard" => "/dashboard"
 */
export function createPageUrl(pageName) {
  if (!pageName) return "/";
  return `/${pageName.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Simple helper to format dates as "MMM d, yyyy"
 * Example: formatDate(new Date()) => "Oct 27, 2025"
 */
export function formatDate(date) {
  if (!date) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

/**
 * Optionally, add more helper functions here if needed
 */
