import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
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
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <ChefBotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
