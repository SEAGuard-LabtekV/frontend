import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { usePreferences } from "@/contexts/UserPreferencesContext";
import { cn } from "@/lib/utils";

/** Reverse-geocode lat/lng to a human-readable string via Nominatim. */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Nominatim error");
  const data = await res.json();
  const { city, town, village, state, country } = data.address ?? {};
  const place = city ?? town ?? village ?? state ?? "";
  return [place, country].filter(Boolean).join(", ");
}

const CHATBOT_URL =
  "https://seaguard-chatbot-865275048150.asia-southeast1.run.app/api/v1/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatbotWidget = () => {
  const location = useLocation();
  const { preferences } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Resolve real device location once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const place = await reverseGeocode(coords.latitude, coords.longitude);
          if (place) setGeoLocation(place);
        } catch {
          // fall back to account preference; handled below
        }
      },
      () => {
        // Permission denied – fall back to account preference
      },
      { timeout: 8000 },
    );
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const res = await fetch(CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          location: geoLocation ?? preferences.country ?? undefined,
          history,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = (await res.json()) as { reply: string };
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the AI service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, geoLocation, preferences.country]);

  // Only render on /dashboard
  if (location.pathname !== "/dashboard") return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-[5.5rem] right-4 lg:bottom-6 lg:right-6 z-[2000] w-80 h-[430px] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-card border border-border animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-destructive shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">
                  SEAGuard AI
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  Disaster preparedness assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-3">
                  <Bot className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  SEAGuard AI Assistant
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Ask me anything about disaster preparedness, evacuation tips,
                  or emergency procedures across ASEAN.
                </p>
                <div className="mt-4 space-y-1.5 w-full">
                  {[
                    "What should I do during a typhoon?",
                    "How to prepare an emergency kit?",
                    "Flood safety tips for Jakarta",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start items-end",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 mb-0.5">
                    <Bot className="h-3.5 w-3.5 text-destructive" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-destructive text-white rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm border border-border",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Bot className="h-3.5 w-3.5 text-destructive" />
                </div>
                <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-card shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about disaster safety..."
              disabled={isLoading}
              className="flex-1 text-xs bg-secondary rounded-xl px-3 py-2.5 outline-none text-foreground placeholder:text-muted-foreground border border-border focus:border-destructive/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive text-white disabled:opacity-40 hover:bg-destructive/90 active:scale-95 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Button — only shown when chat is closed ────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="SEAGuard AI Assistant"
          className={cn(
            "fixed bottom-[5.5rem] right-4 lg:bottom-6 lg:right-6 z-[2000]",
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-destructive text-white shadow-lg",
            "hover:shadow-xl hover:-translate-y-0.5 active:scale-95",
            "transition-all duration-200",
          )}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ChatbotWidget;
