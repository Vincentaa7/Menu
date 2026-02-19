const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken(): Promise<string | null> {
  // Import dynamically to avoid SSR issues
  const { supabase } = await import("./supabase");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API Error");
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Recipes ────────────────────────────────────────────────────────────────

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  image_url?: string;
  ingredients: string[];
  steps: string[];
  category: string;
  created_at: string;
};

export const api = {
  recipes: {
    list: (params?: { search?: string; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      if (params?.category) q.set("category", params.category);
      return apiFetch<Recipe[]>(`/api/recipes${q.toString() ? "?" + q : ""}`);
    },
    get: (id: string) => apiFetch<Recipe>(`/api/recipes/${id}`),
    create: (data: Omit<Recipe, "id" | "user_id" | "created_at">) =>
      apiFetch<Recipe>("/api/recipes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Recipe>) =>
      apiFetch<Recipe>(`/api/recipes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/recipes/${id}`, { method: "DELETE" }),
    uploadImage: async (file: File): Promise<string> => {
      const token = await getToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/api/recipes/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error("Image upload failed");
      const { url } = await res.json();
      return url;
    },
  },
  bookmarks: {
    list: () => apiFetch<{ id: string; recipe_id: string; recipes: Recipe }[]>("/api/bookmarks"),
    add: (recipe_id: string) =>
      apiFetch("/api/bookmarks", { method: "POST", body: JSON.stringify({ recipe_id }) }),
    remove: (recipe_id: string) =>
      apiFetch(`/api/bookmarks/${recipe_id}`, { method: "DELETE" }),
  },
  chat: {
    send: (message: string, history: { role: string; content: string }[]) =>
      apiFetch<{ reply: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      }),
  },
};
