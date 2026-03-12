import type { FC, SVGProps } from "react";

export const SensorGenericIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
