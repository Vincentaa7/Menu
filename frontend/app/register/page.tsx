"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import Link from "next/link";
import { ChefHat, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter ya!");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600/20">
              <ChefHat className="h-8 w-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Buat Akun Baru</h1>
            <p className="mt-1 text-sm text-neutral-400">Mulai berbagi resep favoritmu!</p>
          </div>

          {success ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5 text-center">
              <p className="text-green-400 font-medium">🎉 Akun berhasil dibuat!</p>
              <p className="mt-1 text-sm text-neutral-400">
                Cek email kamu untuk verifikasi, lalu{" "}
                <Link href="/login" className="text-rose-400 hover:underline">masuk di sini</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-neutral-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  className="border-white/10 bg-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-neutral-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="border-white/10 bg-neutral-800 pr-10 text-white placeholder:text-neutral-600 focus-visible:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Daftar Sekarang
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-neutral-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-rose-400 hover:text-rose-300">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
