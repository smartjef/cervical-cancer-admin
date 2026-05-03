"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function uploadAPK(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;

  console.log("Upload APK Token present:", !!token);

  const res = await fetch(`${API_BASE_URL}/apks`, {
    method: "POST",
    body: formData,
    headers: {
        ...(token ? { 
            Authorization: `Bearer ${token}`,
            Cookie: `better-auth.session_token=${token}`
        } : {}),
    }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || "Failed to upload APK");
  }

  revalidatePath("/dashboard/apks");
  revalidatePath("/download");
  return res.json();
}

export async function getAPKs() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session_token")?.value;

    const res = await fetch(`${API_BASE_URL}/apks`, {
      cache: "no-store",
      headers: {
          ...(token ? { 
              Authorization: `Bearer ${token}`,
              Cookie: `better-auth.session_token=${token}`
          } : {}),
      }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching APKs:", e);
    return [];
  }
}

export async function deleteAPK(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;

  const res = await fetch(`${API_BASE_URL}/apks/${id}`, {
    method: "DELETE",
    headers: {
        ...(token ? { 
            Authorization: `Bearer ${token}`,
            Cookie: `better-auth.session_token=${token}`
        } : {}),
    }
  });

  if (!res.ok) {
    throw new Error("Failed to delete APK");
  }

  revalidatePath("/dashboard/apks");
  revalidatePath("/download");
  return { success: true };
}

export async function toggleApkStatus(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;

  const res = await fetch(`${API_BASE_URL}/apks/${id}/toggle`, {
    method: "PATCH",
    headers: {
        ...(token ? { 
            Authorization: `Bearer ${token}`,
            Cookie: `better-auth.session_token=${token}`
        } : {}),
    }
  });

  if (!res.ok) {
    throw new Error("Failed to toggle status");
  }

  revalidatePath("/dashboard/apks");
  revalidatePath("/download");
  return res.json();
}

