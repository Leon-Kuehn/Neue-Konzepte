import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function DepositPlaceIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "deposit-place--active" : "deposit-place--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 120 120" className={mergedClassName} {...props}>
      <rect x="14" y="14" width="92" height="92" rx="12" fill="#F97316" stroke="#EA580C" strokeWidth="4" />
      <rect x="24" y="24" width="72" height="72" rx="8" fill="#FACC15" stroke="#F59E0B" strokeWidth="2" />

      <rect x="32" y="62" width="56" height="20" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

      <rect
        className="deposit-place__scanline"
        x="36"
        y="36"
        width="48"
        height="48"
        rx="6"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="5 3"
      />

      {active ? (
        <g className="deposit-place__ready">
          <circle cx="90" cy="28" r="12" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          <path d="M84 28 L89 33 L97 23" fill="none" stroke="#ECFDF5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
    </svg>
  );
}
