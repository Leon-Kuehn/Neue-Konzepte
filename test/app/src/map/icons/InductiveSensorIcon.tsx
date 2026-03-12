import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function InductiveSensorIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "inductive--active" : "inductive--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 64 32" className={mergedClassName} {...props}>
      <rect x="6" y="8" width="24" height="16" rx="8" fill="#4b5563" />
      <rect x="24" y="11" width="10" height="10" rx="2" fill="#9ca3af" />
      <g className="inductive__field" fill="none" stroke="#34d399" strokeWidth="2">
        <circle cx="40" cy="16" r="4" />
        <circle cx="40" cy="16" r="7" />
        <circle cx="40" cy="16" r="10" />
      </g>
    </svg>
  );
}
