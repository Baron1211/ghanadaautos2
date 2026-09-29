type Props = {
  ghs: number | null | undefined;
  /** Deprecated: prices are shown in GHS only. */
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

export default function DualPrice({ ghs, suffix, size = "md", decimals = 0 }: Props) {
  return (
    <div className={`ga-price-stack ga-price-${size}`}>
      <div className="ga-price-main">
        <span className="ga-price-flagwrap">
          <GhFlag />
          <span className="ga-price-flagdot" aria-hidden="true" />
        </span>
        <span className="ga-price-figure">
          <span className="ga-price-label">Local price</span>
          <span className="ga-price-amount">
            <span className="ga-price-symbol">GH₵</span>
            <span className="ga-price-val">{fmt(Number(ghs), decimals)}</span>
            {suffix ? <span className="ga-price-suffix">{suffix}</span> : null}
          </span>
        </span>
      </div>
    </div>
  );
}
