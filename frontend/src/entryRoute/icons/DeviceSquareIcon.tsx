import type { FC, SVGProps } from "react";

export const DeviceSquareIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
    <circle cx="17" cy="7" r="1.2" fill="currentColor" />
  </svg>
);
