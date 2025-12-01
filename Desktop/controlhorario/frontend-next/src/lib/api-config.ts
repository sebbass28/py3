export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getApiUrl(path: string) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
