import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function HighBayStorageIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "highbay--active" : "highbay--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 220 180" className={mergedClassName} {...props}>
      <rect x="16" y="10" width="92" height="160" rx="10" fill="#7F1D1D" stroke="#991B1B" strokeWidth="4" />

      <rect x="28" y="20" width="68" height="25" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3" />
      <rect x="28" y="49" width="68" height="25" rx="4" fill="#FECACA" stroke="#EF4444" strokeWidth="3" />
      <rect x="28" y="78" width="68" height="25" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3" />
      <rect x="28" y="107" width="68" height="25" rx="4" fill="#FECACA" stroke="#EF4444" strokeWidth="3" />
      <rect x="28" y="136" width="68" height="25" rx="4" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3" />

      <rect x="126" y="18" width="10" height="146" rx="4" fill="#6B7280" />

      <g className="highbay__carriage">
        <rect x="120" y="42" width="22" height="16" rx="4" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2" />
        <rect className="highbay__fork" x="142" y="48" width="34" height="4" rx="2" fill="#38BDF8" />
        <rect className="highbay__fork" x="142" y="53" width="26" height="4" rx="2" fill="#7DD3FC" />
      </g>

      <circle cx="131" cy="28" r="4" fill="#94A3B8" />
      <circle cx="131" cy="154" r="4" fill="#94A3B8" />
    </svg>
  );
}