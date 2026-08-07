type Props = {
  ghs: number | null | undefined;
  cad?: number | null;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  decimals?: number;
};

const fmt = (n: number, decimals: number) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function DualPrice({ ghs, cad, suffix, size = "md", decimals = 0 }: Props) {
  return (
    <div className={`ga-price-stack ga-price-${size}`}>
      <span className="ga-price-row ga-price-primary">
        <span className="ga-flag" aria-hidden="true">🇬🇭</span>
        <span className="ga-price-cur">GHS</span>
        <span className="ga-price-val">{fmt(Number(ghs), decimals)}</span>
        {suffix ? <span className="ga-price-suffix">{suffix}</span> : null}
      </span>
      {cad != null && Number(cad) > 0 ? (
        <span className="ga-price-row ga-price-secondary">
          <span className="ga-flag" aria-hidden="true">🇨🇦</span>
          <span className="ga-price-cur">CAD</span>
          <span className="ga-price-val">${fmt(Number(cad), decimals)}</span>
          {suffix ? <span className="ga-price-suffix">{suffix}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
