"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Recipe } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Edit, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.recipes.get(id).then(setRecipe).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.bookmarks.list().then((data) => {
      setBookmarked(data.some((b) => b.recipe_id === id));
    }).catch(() => {});
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) return;
    try {
      if (bookmarked) {
        await api.bookmarks.remove(id);
        setBookmarked(false);
      } else {
        await api.bookmarks.add(id);
        setBookmarked(true);
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("Yakin mau hapus resep ini?")) return;
    setDeleting(true);
    try {
      await api.recipes.delete(id);
      router.push("/");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="py-32 text-center text-neutral-400">
        <p className="text-5xl mb-4">🍽️</p>
        <p>Resep tidak ditemukan.</p>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Feed
      </Link>

      {/* Image */}
      {recipe.image_url && (
        <div className="relative mb-6 h-72 w-full overflow-hidden rounded-2xl">
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-block rounded-full bg-rose-500/20 px-3 py-0.5 text-xs text-rose-400 font-medium">
            {recipe.category}
          </span>
          <h1 className="text-3xl font-bold text-white">{recipe.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(recipe.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {user && (
            <Button variant="outline" size="icon" onClick={toggleBookmark}
              className="border-white/10 bg-neutral-900 hover:bg-neutral-800">
              {bookmarked
                ? <BookmarkCheck className="h-4 w-4 text-rose-400" />
                : <Bookmark className="h-4 w-4" />}
            </Button>
          )}
          {isOwner && (
            <>
              <Button variant="outline" size="icon" asChild
                className="border-white/10 bg-neutral-900 hover:bg-neutral-800">
                <Link href={`/recipes/${id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" onClick={handleDelete} disabled={deleting}
                className="border-red-500/30 bg-neutral-900 hover:bg-red-500/10 hover:text-red-400">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">🥘 Bahan-bahan</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-600/30 text-xs font-bold text-rose-400">
                {i + 1}
              </span>
              <span className="text-neutral-300">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">👨‍🍳 Langkah Memasak</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="rounded-xl border border-white/10 bg-neutral-900 p-4">
              <span className="mb-1 block text-xs font-bold text-rose-400 uppercase tracking-wider">
                Langkah {i + 1}
              </span>
              <p className="text-neutral-300 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
