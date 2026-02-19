"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Recipe } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Nusantara", "Internasional", "Dessert", "Minuman", "Vegetarian", "Umum"];

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Umum");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    api.recipes.get(id).then((data) => {
      setRecipe(data);
      setTitle(data.title);
      setCategory(data.category);
      setIngredients(data.ingredients.length ? data.ingredients : [""]);
      setSteps(data.steps.length ? data.steps : [""]);
    }).finally(() => setLoadingRecipe(false));
  }, [id]);

  const updateItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => setter((prev) => prev.map((v, i) => (i === index ? value : v)));

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => setter((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.recipes.update(id, {
        title,
        category,
        ingredients: ingredients.filter((v) => v.trim()),
        steps: steps.filter((v) => v.trim()),
      });
      router.push(`/recipes/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
      setSaving(false);
    }
  };

  if (loadingRecipe) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!recipe) {
    return <div className="py-32 text-center text-neutral-400">Resep tidak ditemukan.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/recipes/${id}`} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Detail
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-white">✏️ Edit Resep</h1>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Nama Resep</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="border-white/10 bg-neutral-900 text-white focus-visible:ring-rose-500" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Kategori</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <Label className="text-neutral-300">Bahan-bahan</Label>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <Input value={ing} onChange={(e) => updateItem(setIngredients, i, e.target.value)}
                className="flex-1 border-white/10 bg-neutral-900 text-white focus-visible:ring-rose-500" />
              <Button type="button" variant="ghost" size="icon"
                onClick={() => removeItem(setIngredients, i)}
                disabled={ingredients.length === 1}
                className="text-neutral-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
            onClick={() => setIngredients((p) => [...p, ""])}
            className="border-white/10 text-neutral-300 hover:text-white">
            <Plus className="mr-1 h-4 w-4" /> Tambah Bahan
          </Button>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <Label className="text-neutral-300">Langkah Memasak</Label>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex items-start gap-2 flex-1">
                <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600/30 text-xs font-bold text-rose-400">
                  {i + 1}
                </span>
                <textarea value={step} onChange={(e) => updateItem(setSteps, i, e.target.value)}
                  rows={2}
                  className="flex-1 resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
              </div>
              <Button type="button" variant="ghost" size="icon"
                onClick={() => removeItem(setSteps, i)}
                disabled={steps.length === 1}
                className="mt-1 text-neutral-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
            onClick={() => setSteps((p) => [...p, ""])}
            className="border-white/10 text-neutral-300 hover:text-white">
            <Plus className="mr-1 h-4 w-4" /> Tambah Langkah
          </Button>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>
        )}

        <Button type="submit" disabled={saving}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-6">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          💾 Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}
