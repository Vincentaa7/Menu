"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { ChefHat, X, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChefBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Aku Chef Bot 👨‍🍳 Mau tanya soal resep, tips memasak, atau cara pakai aplikasi ini? Aku siap bantu!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10);
      const { reply } = await api.chat.send(userMsg.content, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, ada gangguan koneksi. Coba lagi ya! 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div className="flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-3">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-white" />
              <div>
                <p className="text-sm font-bold text-white">Chef Bot</p>
                <p className="text-xs text-rose-100">Asisten Koki Virtual 🍳</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-rose-600 text-white"
                      : "rounded-tl-sm bg-neutral-800 text-neutral-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-neutral-800 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya soal resep..."
                className="flex-1 border-white/10 bg-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-rose-500"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-110 hover:shadow-rose-500/50"
        aria-label="Open Chef Bot"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}
