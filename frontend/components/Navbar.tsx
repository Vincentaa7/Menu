"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut, Bookmark, PlusCircle, LogIn, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: "var(--navbar-bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          style={{ color: "var(--foreground)" }}
        >
          <ChefHat className="h-7 w-7 text-rose-500" />
          <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            ResepKu
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark/Light Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 p-0"
            style={{ color: "var(--muted-foreground)" }}
            title={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {loading ? null : user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--muted-foreground)" }}
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
                style={{ color: "var(--muted-foreground)" }}
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
                className="hover:text-rose-400"
                style={{ color: "var(--muted-foreground)" }}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--muted-foreground)" }}
                asChild
              >
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
