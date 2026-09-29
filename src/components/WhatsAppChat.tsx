import { useEffect, useState } from "react";
import logoAsset from "@/assets/rrr-logo-stacked.png";

const NUMBER = "233592495787";
const DISPLAY = "+233 592 495 787";

const link = (text: string) => `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;

const WaGlyph = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.003 3C8.83 3 3 8.83 3 16c0 2.29.6 4.52 1.74 6.49L3 29l6.68-1.75A12.94 12.94 0 0 0 16.003 29C23.17 29 29 23.17 29 16S23.17 3 16.003 3Zm0 23.7c-1.98 0-3.92-.53-5.62-1.54l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.7 10.7 0 1 1 16 26.7Zm5.87-8c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.51-.16-.73.16-.21.32-.83 1.04-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z"
    />
  </svg>
);

const Verified = () => (
  <svg className="wa2-verified" viewBox="0 0 24 24" aria-label="Verified business">
    <path
      fill="#25d366"
      d="M12 1.6 14.6 3l2.9-.2 1.5 2.5 2.5 1.5-.2 2.9L22.7 12l-1.4 2.6.2 2.9-2.5 1.5-1.5 2.5-2.9-.2L12 22.7 9.4 21.3l-2.9.2L5 19l-2.5-1.5.2-2.9L1.3 12l1.4-2.6-.2-2.9L5 5l1.5-2.5 2.9.2L12 1.6Z"
    />
    <path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m8 12.3 2.8 2.8L16.2 9.5" />
  </svg>
);

export default function WhatsAppChat() {
  const [open, setOpen] = useState(true);
  const [typing, setTyping] = useState(true);
  const [time, setTime] = useState("");
  const [unread, setUnread] = useState(true);

  useEffect(() => {
    // time is set on the client only, to avoid a server/client text mismatch
    setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    const t = window.setTimeout(() => setTyping(false), 1600);
    return () => window.clearTimeout(t);
  }, []);

  const toggle = () => {
    setOpen((v) => !v);
    setUnread(false);
  };

  return (
    <div className="wa-widget">
      {open && (
        <div className="wa2-window" role="dialog" aria-label="Chat with RRR Auto Export on WhatsApp">
          <div className="wa2-header">
            <img src={logoAsset} alt="RRR Auto Export" className="wa2-avatar" />
            <div className="wa2-who">
              <div className="wa2-name">
                RRR Auto Export <Verified />
              </div>
              <div className="wa2-status">
                <span className="wa2-dot" /> online · {DISPLAY}
              </div>
            </div>
            <button className="wa2-close" aria-label="Close chat" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="wa2-body">
            <div className="wa2-day">TODAY</div>
            <div className="wa2-secure">Messages are end-to-end encrypted on WhatsApp.</div>
            {typing ? (
              <div className="wa2-bubble wa2-typing" aria-label="typing">
                <i /><i /><i />
              </div>
            ) : (
              <div className="wa2-bubble">
                <span>
                  Hello, welcome to <b>RRR Auto Export</b>. How may I help you today?
                </span>
                <em>{time}</em>
              </div>
            )}
            {!typing && (
              <div className="wa2-quick">
                <a href={link("Hello RRR Auto Export, I'd like to chat.")} target="_blank" rel="noopener noreferrer">
                  Start Chat
                </a>
                <a href={link("Hello RRR Auto Export, I have a sales inquiry.")} target="_blank" rel="noopener noreferrer">
                  Sales Inquiry
                </a>
                <a href={link("Hello RRR Auto Export, I want to import a vehicle from China.")} target="_blank" rel="noopener noreferrer">
                  Import from China
                </a>
              </div>
            )}
          </div>

          <a className="wa2-input" href={link("Hello RRR Auto Export!")} target="_blank" rel="noopener noreferrer">
            <span>Type a message</span>
            <b aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.5L15 12 3.39 13.9z" /></svg>
            </b>
          </a>
        </div>
      )}
      <button className="wa-fab" aria-label="Chat on WhatsApp" onClick={toggle}>
        <WaGlyph />
        {unread && !open && <span className="wa-badge">1</span>}
      </button>
    </div>
  );
}
