type Props = {
  ghs: number | null | undefined;
  cad?: number | null;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  decimals?: number;
};

const fmt = (n: number, decimals: number) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function GhFlag() {
  return (
    <svg className="ga-flag" viewBox="0 0 18 12" role="img" aria-label="Ghana">
      <rect width="18" height="4" y="0" fill="#CE1126" />
      <rect width="18" height="4" y="4" fill="#FCD116" />
      <rect width="18" height="4" y="8" fill="#006B3F" />
      <path d="M9 4.4l.62 1.9h2l-1.62 1.18.62 1.9L9 8.2 7.38 9.38 8 7.48 6.38 6.3h2z" fill="#000" />
    </svg>
  );
}

function CaFlag() {
  return (
    <svg className="ga-flag" viewBox="0 0 18 12" role="img" aria-label="Canada">
      <rect width="18" height="12" fill="#fff" />
      <rect width="4.5" height="12" x="0" fill="#D52B1E" />
      <rect width="4.5" height="12" x="13.5" fill="#D52B1E" />
      <path d="M9 2.6l.7 1.6 1.5-.5-.6 1.5 1.1.6-1.2.7.3 1.1-1.3-.3-.2 1.5h-.6l-.2-1.5-1.3.3.3-1.1L6.3 6.3l1.1-.6-.6-1.5 1.5.5z" fill="#D52B1E" />
    </svg>
  );
}

export default function DualPrice({ ghs, cad, suffix, size = "md", decimals = 0 }: Props) {
  return (
    <div className={`ga-price-stack ga-price-${size}`}>
      <span className="ga-price-row ga-price-primary">
        <GhFlag />
        <span className="ga-price-cur">GHS</span>
        <span className="ga-price-val">{fmt(Number(ghs), decimals)}</span>
        {suffix ? <span className="ga-price-suffix">{suffix}</span> : null}
      </span>
      {cad != null && Number(cad) > 0 ? (
        <span className="ga-price-row ga-price-secondary">
          <CaFlag />
          <span className="ga-price-cur">CAD</span>
          <span className="ga-price-val">${fmt(Number(cad), decimals)}</span>
          {suffix ? <span className="ga-price-suffix">{suffix}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
