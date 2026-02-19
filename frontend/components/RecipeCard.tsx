"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Recipe, api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";


type Props = {
  recipe: Recipe;
  bookmarked?: boolean;
  onBookmarkChange?: () => void;
};

const categoryColors: Record<string, string> = {
  "Nusantara": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Internasional": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Dessert": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Minuman": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Vegetarian": "bg-green-500/20 text-green-300 border-green-500/30",
  "Umum": "bg-neutral-500/20 text-neutral-300 border-neutral-500/30",
};

export default function RecipeCard({ recipe, bookmarked = false, onBookmarkChange }: Props) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await api.bookmarks.remove(recipe.id);
        setIsBookmarked(false);
      } else {
        await api.bookmarks.add(recipe.id);
        setIsBookmarked(true);
      }
      onBookmarkChange?.();
    } catch {
      // silently fail
    } finally {
      setBookmarkLoading(false);
    }
  };

  const colorClass = categoryColors[recipe.category] || categoryColors["Umum"];

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/10">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">🍳</div>
          )}
          {/* Bookmark button */}
          {user && (
            <button
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 backdrop-blur-sm transition-all hover:bg-black/70 disabled:opacity-50"
              aria-label="Bookmark recipe"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-rose-400" />
              ) : (
                <Bookmark className="h-4 w-4 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white line-clamp-2 leading-snug">
              {recipe.title}
            </h3>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
              {recipe.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              {new Date(recipe.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
