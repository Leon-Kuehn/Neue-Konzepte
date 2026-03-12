import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function RfidSensorIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "rfid--active" : "rfid--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 64 32" className={mergedClassName} {...props}>
      <rect x="6" y="8" width="18" height="16" rx="3" fill="#374151" />
      <rect x="10" y="12" width="10" height="8" rx="1.5" fill="#9ca3af" />
      <g className="rfid__waves" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
        <path d="M28 16c3-3 5-3 8 0" />
        <path d="M32 12c5-5 9-5 14 0" />
        <path d="M32 20c5 5 9 5 14 0" />
      </g>
    </svg>
  );
}
