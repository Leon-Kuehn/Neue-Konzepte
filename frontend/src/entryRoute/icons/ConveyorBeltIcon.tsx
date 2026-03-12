import type { SVGProps } from "react";

export type ConveyorDirection = "left" | "right";

type Props = SVGProps<SVGSVGElement> & {
  direction?: ConveyorDirection;
};

export function ConveyorBeltIcon({ direction = "left", className, ...props }: Props) {
  const dirClass = direction === "right" ? "belt--right" : "belt--left";
  const mergedClassName = `${className ?? ""} ${dirClass}`.trim();

  return (
    <svg viewBox="0 0 260 70" className={mergedClassName} {...props}>
      <rect x="18" y="10" width="224" height="12" rx="4" fill="#F97316" />
      <rect x="18" y="22" width="224" height="30" rx="6" fill="#FACC15" stroke="#F59E0B" strokeWidth="3" />
      <g className="belt__segments">
        <rect x="30" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="48" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="66" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="84" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="102" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="120" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="138" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="156" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="174" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="192" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
        <rect x="210" y="22" width="10" height="30" fill="#F59E0B" opacity="0.7" />
      </g>
      <rect x="18" y="52" width="224" height="8" rx="4" fill="#F97316" />
    </svg>
  );
}
