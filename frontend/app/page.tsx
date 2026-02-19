"use client";

import { useState, useEffect, useCallback } from "react";
import { api, Recipe } from "@/lib/api";
import RecipeCard from "@/components/RecipeCard";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Loader2, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["Semua", "Nusantara", "Internasional", "Dessert", "Minuman", "Vegetarian", "Umum"];

export default function HomePage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params: { search?: string; category?: string } = {};
      if (search) params.search = search;
      if (activeCategory !== "Semua") params.category = activeCategory;
      const data = await api.recipes.list(params);
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.bookmarks.list();
      setBookmarkedIds(new Set(data.map((b) => b.recipe_id)));
    } catch {}
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(fetchRecipes, 300);
    return () => clearTimeout(timer);
  }, [fetchRecipes]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm text-rose-400">
          <ChefHat className="h-4 w-4" />
          Platform Berbagi Resep #1
        </div>
        <h1 className="mb-3 bg-gradient-to-r from-white via-rose-100 to-orange-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Temukan Resep Terbaik
        </h1>
        <p className="mx-auto max-w-xl text-neutral-400">
          Ribuan resep masakan dari seluruh Nusantara & dunia, siap kamu eksplor dan bagikan!
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari resep favorit kamu..."
          className="pl-10 border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus-visible:ring-rose-500"
        />
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "border border-white/10 bg-neutral-900 text-neutral-400 hover:border-rose-500/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="py-20 text-center text-neutral-500">
          <div className="mb-3 text-5xl">🍽️</div>
          <p>Belum ada resep ditemukan.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              bookmarked={bookmarkedIds.has(recipe.id)}
              onBookmarkChange={fetchBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
