import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = Cookies.get("better-auth.session_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // Ensure cookies are sent
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Optional: Handle unauthorized (e.g., redirect to login)
      // But we'll handle this in middleware mostly.
    }
    const error = await res
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(error.message || res.statusText);
  }

  if (res.status === 204) return null;
  return res.json();
}
