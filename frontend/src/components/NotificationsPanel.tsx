import { useEffect, useState } from "react";
import { MessageCircle, X, Bell } from "lucide-react";
import { SimNotification, formatTime } from "@/lib/notifications";
import { cn } from "@/lib/utils";

/**
 * Listens for global "fwo:notify" CustomEvents (detail: SimNotification[])
 * and shows them in a floating WhatsApp-style chat panel.
 */
const NotificationsPanel = () => {
  const [messages, setMessages] = useState<SimNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SimNotification[]>).detail;
      if (!detail) return;
      setMessages((prev) => [...prev, ...detail]);
      setOpen(true);
      // Mark as read after a short delay (simulates double-tick).
      detail.forEach((m) => {
        setTimeout(() => {
          setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
        }, 1500);
      });
    };
    window.addEventListener("fwo:notify", handler as EventListener);
    return () => window.removeEventListener("fwo:notify", handler as EventListener);
  }, []);

  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg grid place-items-center hover:opacity-90 transition"
        aria-label="Open notifications"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-warning-foreground text-[10px] grid place-items-center font-semibold">
            {unread}
          </span>
        )}
      </button>

      {/* Phone mockup */}
      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-[28px] border-[6px] border-foreground/80 bg-[hsl(120_25%_94%)] shadow-2xl overflow-hidden flex flex-col"
          style={{ height: 460 }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 grid place-items-center text-xs font-semibold">
              FW
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Food Waste Optimizer</div>
              <div className="text-[10px] opacity-80">simulated · demo</div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[hsl(120_25%_94%)]">
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center text-center px-4">
                <div>
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Trigger an urgent match (expiry ≤ 2h) or use the demo button to see WhatsApp-style alerts here.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm",
                    "ml-auto bg-[hsl(140_45%_82%)] text-foreground rounded-br-md",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                    to {m.to === "ngo" ? "NGO" : "Volunteer"} · {m.recipientName}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className="flex items-center gap-1 justify-end mt-1 text-[10px] opacity-70">
                    <span>{formatTime(m.timestamp)}</span>
                    <span className={m.read ? "text-primary" : "opacity-60"}>✓✓</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsPanel;