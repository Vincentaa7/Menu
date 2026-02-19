"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut, Bookmark, PlusCircle, LogIn } from "lucide-react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <ChefHat className="h-7 w-7 text-rose-500" />
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            ResepKu
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-300 hover:text-white"
                asChild
              >
                <Link href="/recipes/new">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Buat Resep
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-300 hover:text-white"
                asChild
              >
                <Link href="/bookmarks">
                  <Bookmark className="mr-1 h-4 w-4" />
                  Simpanan
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-rose-400"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white" asChild>
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" />
                  Masuk
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-rose-500 hover:bg-rose-600 text-white"
                asChild
              >
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
