const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api";

export async function apiRequest(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(error.message || res.statusText);
    }

    if (res.status === 204) return null;
    return res.json();
}
