import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import ChefBotWidget from "@/components/ChefBotWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResepKu — Platform Berbagi Resep Masakan",
  description: "Temukan, bagikan, dan simpan resep masakan favoritmu. Didukung AI Chef Bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={inter.className}
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <ChefBotWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
