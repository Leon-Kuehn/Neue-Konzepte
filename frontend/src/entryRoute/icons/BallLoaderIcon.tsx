import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function BallLoaderIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "ballloader--active" : "ballloader--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 60 150" className={mergedClassName} {...props}>
      {/* Kugelbahn-Rohr */}
      <rect
        x="16"
        y="5"
        width="28"
        height="90"
        rx="14"
        fill="#1e3a8a"
        stroke="#3b82f6"
        strokeWidth="2.5"
      />
      {/* Pneumatik-Anschluss oben */}
      <rect
        x="23"
        y="2"
        width="14"
        height="6"
        rx="3"
        fill="#2563eb"
        stroke="#60a5fa"
        strokeWidth="1"
      />
      {/* Auslass-Öffnung unten */}
      <rect
        x="24"
        y="94"
        width="12"
        height="14"
        rx="3"
        fill="#0f172a"
        stroke="#60a5fa"
        strokeWidth="1.5"
      />
      {/* Kugel A – oben, rollt zuletzt */}
      <g className="ballloader__ball--a">
        <circle cx="30" cy="28" r="10" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.5" />
        <circle cx="26" cy="24" r="3" fill="white" opacity="0.35" />
      </g>
      {/* Kugel B – mitte */}
      <g className="ballloader__ball--b">
        <circle cx="30" cy="53" r="10" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.5" />
        <circle cx="26" cy="49" r="3" fill="white" opacity="0.35" />
      </g>
      {/* Kugel C – unten, rollt zuerst */}
      <g className="ballloader__ball--c">
        <circle cx="30" cy="78" r="10" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
        <circle cx="26" cy="74" r="3" fill="white" opacity="0.35" />
      </g>
      {/* Basis-Platte */}
      <rect
        x="20"
        y="108"
        width="20"
        height="6"
        rx="2"
        fill="#1e3a8a"
        stroke="#3b82f6"
        strokeWidth="1.5"
      />
    </svg>
  );
}
