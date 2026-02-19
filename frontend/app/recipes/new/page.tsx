"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Recipe } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Nusantara", "Internasional", "Dessert", "Minuman", "Vegetarian", "Umum"];

type PageMode = "new" | "edit";

function RecipeForm({ mode, initialData }: { mode: PageMode; initialData?: Recipe }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Umum");
  const imageUrl = initialData?.image_url ?? "";
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? [""]);
  const [steps, setSteps] = useState<string[]>(initialData?.steps ?? [""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter((prev) => [...prev, ""]);

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
    setError("");
    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await api.recipes.uploadImage(imageFile);
      }
      const payload = {
        title,
        category,
        image_url: finalImageUrl || undefined,
        ingredients: ingredients.filter((v) => v.trim()),
        steps: steps.filter((v) => v.trim()),
      };
      if (mode === "new") {
        const created = await api.recipes.create(payload);
        router.push(`/recipes/${created.id}`);
      } else {
        await api.recipes.update(initialData!.id, payload);
        router.push(`/recipes/${initialData!.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan resep");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-white">
        {mode === "new" ? "✨ Tambah Resep Baru" : "✏️ Edit Resep"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Nama Resep</Label>
          <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} required
            placeholder="cth: Rendang Daging Sapi Empuk"
            className="border-white/10 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:ring-rose-500" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Kategori</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Image */}
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Foto Resep (Opsional)</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-neutral-900 p-6 text-center hover:border-rose-500/50 transition-colors">
            {imagePreview ? (
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image src={imagePreview} alt="preview" fill className="object-cover" />
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-neutral-500" />
                <p className="text-sm text-neutral-400">Klik untuk upload foto</p>
                <p className="text-xs text-neutral-600">JPG, PNG, WEBP (maks 5MB)</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <Label className="text-neutral-300">Bahan-bahan</Label>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <Input value={ing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(setIngredients, i, e.target.value)}
                placeholder={`Bahan ${i + 1}`}
                className="flex-1 border-white/10 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:ring-rose-500" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(setIngredients, i)}
                disabled={ingredients.length === 1}
                className="text-neutral-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setIngredients)}
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
                  placeholder={`Langkah ${i + 1}...`} rows={2}
                  className="flex-1 resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(setSteps, i)}
                disabled={steps.length === 1}
                className="mt-1 text-neutral-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(setSteps)}
            className="border-white/10 text-neutral-300 hover:text-white">
            <Plus className="mr-1 h-4 w-4" /> Tambah Langkah
          </Button>
        </div>

        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>}

        <Button type="submit" disabled={saving}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-6">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "new" ? "🍳 Publikasikan Resep" : "💾 Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
}

// ─── New Recipe Page ─────────────────────────────────────────────────────────
export default function NewRecipePage() {
  return <RecipeForm mode="new" />;
}
