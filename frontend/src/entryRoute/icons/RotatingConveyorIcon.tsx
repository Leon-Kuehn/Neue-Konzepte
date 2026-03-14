import type { SVGProps } from "react";

import type { ConveyorDirection } from "./ConveyorBeltIcon";

type Props = SVGProps<SVGSVGElement> & {
  direction?: ConveyorDirection;
};

export function RotatingConveyorIcon({
  direction = "left",
  className,
  ...props
}: Props) {
  const dirClass = direction === "right" ? "belt--right" : "belt--left";
  const mergedClassName = `${className ?? ""} rotating-belt ${dirClass}`.trim();

  return (
    <svg viewBox="0 0 260 104" className={mergedClassName} {...props}>
      <g className="rotating-belt__pivot">
        <rect
          className="rotating-belt__pivot-base"
          x="104"
          y="2"
          width="52"
          height="16"
          rx="8"
          fill="#082f49"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <rect
          className="rotating-belt__pivot-neck"
          x="126"
          y="18"
          width="8"
          height="12"
          rx="4"
          fill="#0ea5e9"
        />
        <circle
          className="rotating-belt__pivot-joint"
          cx="130"
          cy="32"
          r="7"
          fill="#082f49"
          stroke="#38bdf8"
          strokeWidth="3"
        />
      </g>

      <g className="rotating-belt__frame">
        <rect x="18" y="30" width="224" height="12" rx="4" fill="#ea580c" />
        <rect
          x="18"
          y="42"
          width="224"
          height="30"
          rx="6"
          fill="#171717"
          stroke="#f59e0b"
          strokeWidth="3"
        />
        <g className="belt__segments">
          <rect x="30" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="48" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="66" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="84" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="102" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="120" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="138" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="156" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="174" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="192" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
          <rect x="210" y="42" width="10" height="30" fill="#404040" opacity="0.95" />
        </g>
        <rect x="18" y="72" width="224" height="8" rx="4" fill="#ea580c" />
      </g>
    </svg>
  );
}
