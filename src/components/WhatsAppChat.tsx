import { useState } from "react";
import logoAsset from "@/assets/rrr-logo-stacked.png";

const NUMBER = "233592495787";
const DISPLAY = "+233 592 495 787";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(true);

  const link = (text: string) =>
    `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;

  return (
    <div className="wa-widget">
      {open && (
        <div className="wa-card" role="dialog" aria-label="Chat with RRR Auto Export on WhatsApp">
          <button className="wa-close" aria-label="Close chat" onClick={() => setOpen(false)}>×</button>
          <div className="wa-head">
            <img src={logoAsset} alt="RRR Auto Export" className="wa-avatar" />
            <div>
              <div className="wa-name">RRR Auto Export</div>
              <div className="wa-sub">WhatsApp · {DISPLAY}</div>
            </div>
          </div>
          <div className="wa-msg">How may I help you? 😀</div>
          <div className="wa-actions">
            <a className="wa-btn primary" href={link("Hello RRR Auto Export, I'd like to chat.")} target="_blank" rel="noopener noreferrer">Start Chat</a>
            <a className="wa-btn" href={link("Hello RRR Auto Export, I have a sales inquiry.")} target="_blank" rel="noopener noreferrer">Sales Inquiry</a>
          </div>
        </div>
      )}
      <button className="wa-fab" aria-label="Chat on WhatsApp" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.14-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.44.12-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.19 2.01 3.08 4.88 4.32.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41 2.52 0 4.88.98 6.66 2.76a9.34 9.34 0 0 1 2.76 6.66c0 5.19-4.23 9.41-9.43 9.41zm8.02-17.43A11.31 11.31 0 0 0 12.05.75C5.77.75.66 5.86.66 12.14c0 2 .52 3.96 1.52 5.68L.56 23.25l5.57-1.46a11.36 11.36 0 0 0 5.92 1.62h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.38-8.05z"/></svg>
      </button>
    </div>
  );
}
