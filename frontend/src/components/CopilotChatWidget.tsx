import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useLocation } from "react-router-dom";

type ChatRole = "user" | "copilot";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const getTabGreeting = (pathname: string) => {
  if (pathname === "/restaurant") {
    return "Ready to log surplus food? I can help you fill the form or explain how matching works.";
  }
  if (pathname === "/event") {
    return "Planning an event? I can help you predict surplus and schedule NGO pickups in advance.";
  }
  if (pathname === "/ngo") {
    return "Hi! I can help you understand incoming requests or explain the match scoring system.";
  }
  if (pathname === "/volunteer") {
    return "Need help with your deliveries or want to optimize your route?";
  }
  if (pathname === "/analytics") {
    return "Want help reading the waste patterns or understanding what the charts mean?";
  }
  if (pathname === "/impact") {
    return "Want to know how CO2 savings are calculated or how the live map works?";
  }
  return "Hi! I'm RescueBite Copilot. Want to donate food or find an NGO near you?";
};

const getQuickReplies = (pathname: string): string[] => {
  if (pathname === "/restaurant") {
    return ["How do I donate food?", "How does matching work?", "Is the food safe?"];
  }
  if (pathname === "/event") {
    return ["What is the event predictor?", "How does matching work?", "How is CO2 calculated?"];
  }
  if (pathname === "/ngo") {
    return ["How does matching work?", "What does urgent mean?", "Is the food safe?"];
  }
  if (pathname === "/volunteer") {
    return ["How does route optimization work?", "What does urgent mean?", "How does matching work?"];
  }
  if (pathname === "/analytics") {
    return ["How is CO2 calculated?", "How does matching work?", "What does urgent mean?"];
  }
  if (pathname === "/impact") {
    return ["How is CO2 calculated?", "How does matching work?", "How does route optimization work?"];
  }
  return ["How do I donate food?", "How does matching work?", "How is CO2 calculated?"];
};

const getCopilotReply = (input: string) => {
  const normalized = input.toLowerCase().replace(/[?!.]/g, "").trim();

  if (normalized === "how does matching work") {
    return "Matching uses a weighted score: distance, urgency, and NGO capacity. A simple version is score = 0.4 x distance-fit + 0.35 x urgency-fit + 0.25 x capacity-fit. Closer NGOs, faster-expiring food, and available capacity rank higher.";
  }
  if (normalized === "how is co2 calculated") {
    return "We estimate 2.5 kg CO2 prevented per 1 kg of food saved. Example: if 10 kg food is rescued, estimated CO2 savings are about 25 kg.";
  }
  if (normalized === "what does urgent mean") {
    return "Urgent means food expiring within 2 hours, so it gets prioritized for immediate pickup and matching.";
  }
  if (normalized === "how do i donate food") {
    return "Go to the Restaurant tab, enter restaurant name, location, food type, meal quantity, and expiry window, then submit. The system suggests NGO matches, and once accepted, a volunteer pickup is created.";
  }
  if (normalized === "is the food safe") {
    return "Safety uses donation time windows plus quality checks. Food nearing unsafe windows is downgraded or blocked, and the AI photo check helps flag visible spoilage risks before matching.";
  }
  if (normalized === "how does route optimization work") {
    return "Route optimization uses a nearest-neighbor approach: it picks the next closest stop iteratively, then ends at dropoff. This reduces travel distance and helps deliver fresher food faster.";
  }
  if (normalized === "what is the event predictor") {
    return "The event predictor estimates surplus from inputs like event type and guest count. Weddings and corporates use different baseline factors, then the model projects expected leftover meals for pre-scheduled NGO pickups.";
  }

  return "I'm still learning! Try asking about donations, matching, CO2, or routes.";
};

const CopilotChatWidget = () => {
  const { pathname } = useLocation();
  const greeting = useMemo(() => getTabGreeting(pathname), [pathname]);
  const quickReplies = useMemo(() => getQuickReplies(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [quickRepliesDismissed, setQuickRepliesDismissed] = useState(false);
  const [firstOpenDone, setFirstOpenDone] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "copilot",
      text: greeting,
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !typing, [input, typing]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (open && !firstOpenDone) {
      setFirstOpenDone(true);
    }
  }, [open, firstOpenDone]);

  useEffect(() => {
    setMessages((prev) => {
      const hasUserMessage = prev.some((m) => m.role === "user");
      if (hasUserMessage) return prev;
      return [{ id: uid(), role: "copilot", text: greeting }];
    });
  }, [greeting]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    const userMessage: ChatMessage = { id: uid(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    const reply = getCopilotReply(text);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: uid(), role: "copilot", text: reply }]);
    }, 900);
  };

  const sendQuickReply = (text: string) => {
    if (typing) return;
    setQuickRepliesDismissed(true);

    const userMessage: ChatMessage = { id: uid(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    const reply = getCopilotReply(text);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: uid(), role: "copilot", text: reply }]);
    }, 900);
  };

  const showQuickReplies = open && firstOpenDone && !quickRepliesDismissed && messages.every((m) => m.role === "copilot");

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <div
        className={
          "absolute bottom-[64px] right-0 w-[340px] h-[480px] bg-white border border-[#ebebeb] rounded-t-2xl rounded-b-xl shadow-[0_16px_36px_rgba(0,0,0,0.14)] " +
          "transition-all duration-250 origin-bottom-right " +
          (open ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none")
        }
      >
        <div className="h-14 px-4 border-b border-[#ebebeb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[20px] leading-none font-bold text-[#1a3a2a]">RescueBite Copilot</h3>
            <span className="h-2 w-2 rounded-full bg-[#2e9f62]" aria-label="online" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full grid place-items-center text-[#6b6b6b] hover:bg-[#f5f5f0]"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="h-[356px] overflow-y-auto px-3 py-3 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[82%] rounded-2xl px-3 py-2 text-[14px] leading-[1.45] " +
                  (m.role === "user"
                    ? "bg-[#1a3a2a] text-white rounded-br-sm"
                    : "bg-[#f5f5f0] text-[#2f2f2f] rounded-bl-sm")
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-[#f5f5f0] text-[#2f2f2f] rounded-2xl rounded-bl-sm px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#97a092] animate-bounce [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#97a092] animate-bounce [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#97a092] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {showQuickReplies && (
            <div className="pt-1 flex flex-wrap gap-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuickReply(q)}
                  className="text-left text-[12px] rounded-full border border-[#dbe3d7] bg-[#faf9f6] px-3 py-1.5 text-[#1a3a2a] hover:bg-[#f5f5f0]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="h-[68px] border-t border-[#ebebeb] px-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot..."
            className="flex-1 h-10 rounded-full border border-[#dfe3db] bg-white px-4 text-[14px] text-[#2f2f2f] placeholder:text-[#96a09a] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="h-10 w-10 rounded-full bg-[#1a3a2a] text-white grid place-items-center disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[52px] w-[52px] rounded-full bg-[#1a3a2a] text-white grid place-items-center shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
        aria-label="Open Copilot chat"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CopilotChatWidget;
