const isVercelPreview = typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
const fallbackApiBase = isVercelPreview ? "https://creative-upaay-bbxy.onrender.com/api" : "/api";
const API = (import.meta.env.VITE_API_URL || fallbackApiBase).replace(/\/$/, "");

export async function request(path, options = {}) {
  const token = localStorage.getItem("cinema-token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
