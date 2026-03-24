import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function PusherIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "pusher--active" : "pusher--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 180 100" className={mergedClassName} {...props}>
      <g className="pusher__carriage">
        <rect x="24" y="28" width="46" height="32" rx="4" fill="#FACC15" stroke="#F59E0B" strokeWidth="3" />
        <rect x="30" y="34" width="12" height="10" rx="2" fill="#FDE68A" />
        <rect x="50" y="44" width="14" height="10" rx="2" fill="#F59E0B" />
      </g>

      <g className="pusher__ram">
        <rect x="70" y="38" width="72" height="12" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <rect x="136" y="32" width="20" height="24" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
      </g>
    </svg>
  );
}
