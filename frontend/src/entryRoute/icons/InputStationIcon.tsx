import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function InputStationIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "inputstation--active" : "inputstation--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 120 120" className={mergedClassName} {...props}>
      <rect
        className="inputstation__outer"
        x="6"
        y="6"
        width="108"
        height="108"
        rx="18"
        fill="none"
        stroke="#ff1f3d"
        strokeWidth="8"
      />
      <rect
        className="inputstation__inner"
        x="22"
        y="22"
        width="76"
        height="76"
        rx="12"
        fill="none"
        stroke="#ff1f3d"
        strokeWidth="4"
      />
    </svg>
  );
}
