import type { FC, SVGProps } from "react";

export const LightSensorIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="10" r="5" />
    <rect x="10" y="15" width="4" height="5" rx="1" />
    <path d="M4 10h3M17 10h3M6.5 4.5l2 2M15.5 6.5l2-2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);
