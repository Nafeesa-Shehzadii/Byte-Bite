export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "restaurant" | "driver";
}

const BASE = "/api/auth";

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ user: AuthUser }> {
  const res = await fetch(`${BASE}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }
  return res.json();
}

export async function apiLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser }> {
  const res = await fetch(`${BASE}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid credentials");
  }
  return res.json();
}

export async function apiGetSession(): Promise<{ user: AuthUser } | null> {
  const res = await fetch(`${BASE}/get-session`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ? data : null;
}

export async function apiLogout(): Promise<void> {
  await fetch(`${BASE}/sign-out`, { method: "POST" });
}
