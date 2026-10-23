import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aiApi } from "../api/ai.api.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { useDoctorProfile } from "../../doctor-profile/hooks/useDoctorProfile.js";

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: profile } = useDoctorProfile();
  const clinicName = profile?.clinicName || "Health Care Clinic";

  const defaultSuggestions = [
    "I have severe knee & joint pain",
    "Chest tightness and palpitations",
    "Skin rash and itching for 3 days",
    "Persistent fever and headache"
  ];

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! 👋 I'm your **HealthCare AI Assistant**.\n\nTell me about your symptoms (e.g. *"I have severe joint pain"* or *"chest tightness"*), and I will provide preliminary suggestions and recommend the best specialist for your care.`
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const payloadMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiApi.chat(payloadMessages);

      const assistantMsg = {
        role: "assistant",
        content: res.reply || "I'm here to help with your appointments and healthcare questions.",
        slots: res.slots,
        date: res.date,
        recommendedDoctor: res.recommendedDoctor
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I had trouble reaching the clinic servers. Please try again or visit our booking page directly.",
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSlotSelect = (slot, date) => {
    const bookingPath = user ? "/patient/book-appointment" : "/book-appointment";
    navigate(`${bookingPath}?date=${date || new Date().toISOString().split("T")[0]}&slot=${slot.startTime}`);
    setIsOpen(false);
  };

  const handleDoctorSelect = (doctor) => {
    const bookingPath = user ? "/patient/book-appointment" : "/book-appointment";
    const doctorId = doctor.id || doctor._id || "";
    navigate(`${bookingPath}?doctorId=${doctorId}`);
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared. Tell me about your symptoms or preferred consultation date to get started!"
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[580px] max-h-[85vh] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ECEEEC] bg-gradient-to-r from-[#005235] to-[#1A6B4A] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#005235] bg-[#7EC143]" />
              </div>
              <div>
                <h3 className="font-headline text-sm font-bold text-white">Symptom Checker & Booking AI</h3>
                <p className="text-[11px] font-medium text-emerald-100/80">Active Triage • {clinicName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear chat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-100/70 hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-100/70 hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F8FAF8] p-4 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#005235] text-white">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                  )}

                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    isUser
                      ? "rounded-tr-none bg-[#005235] text-white font-medium"
                      : "rounded-tl-none border border-[#ECEEEC] bg-white text-[#191C1B]"
                  }`}>
                    <div className="whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Recommended Doctor Card */}
                    {msg.recommendedDoctor && (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white p-3 text-left shadow-sm">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005235] text-white font-bold">
                            <span className="material-symbols-outlined text-xl">stethoscope</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-[#005235]">
                              Recommended Specialist
                            </div>
                            <p className="mt-0.5 text-xs font-bold text-gray-900 truncate">
                              {msg.recommendedDoctor.name}
                            </p>
                            <p className="text-[11px] font-semibold text-[#005235] truncate">
                              {msg.recommendedDoctor.specialty}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-1 rounded-xl bg-white/70 p-2 text-[11px] text-gray-600 border border-emerald-100/60">
                          <p className="truncate font-medium text-gray-800">
                            🏥 {msg.recommendedDoctor.clinic}
                          </p>
                          {msg.recommendedDoctor.fee && (
                            <p className="font-semibold text-emerald-800">
                              💰 Consultation Fee: PKR {msg.recommendedDoctor.fee}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDoctorSelect(msg.recommendedDoctor)}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#005235] py-2 text-xs font-bold text-white transition hover:bg-[#003d28] shadow-sm hover:shadow"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          Book Appointment with {msg.recommendedDoctor.name.split(" ")[1] || "Doctor"}
                        </button>
                      </div>
                    )}

                    {/* Interactive Slot Pills */}
                    {msg.slots && msg.slots.length > 0 && (
                      <div className="mt-3 border-t border-[#ECEEEC] pt-2.5">
                        <p className="mb-2 font-bold uppercase tracking-wider text-[10px] text-[#3F4943]">
                          Click a slot to book ({msg.date}):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.slots.map((slot, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSlotSelect(slot, msg.date)}
                              className="rounded-lg border border-[#7EC143] bg-[#F4FBEF] px-2.5 py-1 text-[11px] font-bold text-[#2A5900] transition-colors hover:bg-[#7EC143] hover:text-[#0D2000] active:scale-95"
                            >
                              {slot.startTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[#3F4943]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ACF36E] text-[#005235]">
                  <span className="material-symbols-outlined text-base animate-pulse">smart_toy</span>
                </div>
                <div className="rounded-2xl rounded-tl-none border border-[#ECEEEC] bg-white px-3.5 py-2 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#005235]" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#005235]" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#005235]" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions when history is brief */}
          {messages.length <= 2 && (
            <div className="border-t border-[#ECEEEC] bg-white px-3 py-2">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6F7A72]">
                Try checking symptoms:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {defaultSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(sug)}
                    className="rounded-full bg-[#F2F4F2] px-2.5 py-1 text-[11px] font-medium text-[#3F4943] transition-colors hover:bg-[#7EC143]/20 hover:text-[#005235]"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-[#ECEEEC] bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#F2F4F2] px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#005235]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe symptoms or ask about bookings..."
                className="flex-1 bg-transparent py-1 text-xs text-[#191C1B] placeholder:text-[#6F7A72]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005235] text-white transition hover:bg-[#1A6B4A] disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-gray-400">
              <span>Always consult a doctor for definitive medical advice.</span>
              <Link to="/doctors" onClick={() => setIsOpen(false)} className="font-semibold text-[#005235] hover:underline">
                All Doctors →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Bubble Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#005235] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1A6B4A] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#7EC143]/40"
        aria-label="Open AI Healthcare Assistant"
      >
        <span
          className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:rotate-12"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isOpen ? "close" : "smart_toy"}
        </span>

        {/* Pulse / Badge */}
        {!isOpen && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7EC143] opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#7EC143]" />
            </span>

            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute right-16 top-2 hidden whitespace-nowrap rounded-xl bg-gray-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md sm:block opacity-0 transition-opacity group-hover:opacity-100">
              💬 Symptom Checker & Doctor Match
            </div>
          </>
        )}
      </button>
    </div>
  );
}
