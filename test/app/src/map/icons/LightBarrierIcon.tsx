import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function LightBarrierIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "lightbarrier--active" : "lightbarrier--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 64 32" className={mergedClassName} {...props}>
      <rect x="6" y="6" width="8" height="20" rx="2" fill="#1f2937" />
      <rect x="50" y="6" width="8" height="20" rx="2" fill="#1f2937" />
      <g className="lightbarrier__beam" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="12" x2="48" y2="12" />
        <line x1="16" y1="16" x2="48" y2="16" />
        <line x1="16" y1="20" x2="48" y2="20" />
      </g>
    </svg>
  );
}
