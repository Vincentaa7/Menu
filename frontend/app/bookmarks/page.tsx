"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Recipe } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { Loader2, Bookmark } from "lucide-react";

type BookmarkEntry = {
  id: string;
  recipe_id: string;
  recipes: Recipe;
};

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const data = await api.bookmarks.list() as BookmarkEntry[];
      setBookmarks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user, fetchBookmarks]);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.recipe_id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Bookmark className="h-7 w-7 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Resep Simpanan</h1>
          <p className="text-sm text-neutral-400">Koleksi resep yang kamu tandai</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-3 text-5xl">🔖</p>
          <p className="text-neutral-400">Belum ada resep yang disimpan.</p>
          <p className="text-sm text-neutral-600 mt-1">
            Klik ikon bookmark di kartu resep untuk menyimpannya di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {bookmarks.map((b) => (
            <RecipeCard
              key={b.id}
              recipe={b.recipes}
              bookmarked={bookmarkedIds.has(b.recipe_id)}
              onBookmarkChange={fetchBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
