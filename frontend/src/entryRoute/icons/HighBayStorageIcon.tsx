import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

export function HighBayStorageIcon({ active = false, className, ...props }: Props) {
  const stateClass = active ? "highbay--active" : "highbay--inactive";
  const mergedClassName = `${className ?? ""} ${stateClass}`.trim();

  return (
    <svg viewBox="0 0 120 760" className={mergedClassName} {...props}>
      <rect x="12" y="8" width="58" height="744" rx="8" fill="#F97316" stroke="#EA580C" strokeWidth="5" />
      <rect x="18" y="14" width="46" height="732" rx="6" fill="#FACC15" stroke="#F59E0B" strokeWidth="3" />

      <rect x="22" y="24" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="90" width="38" height="58" rx="4" fill="#FDE68A" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="156" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="222" width="38" height="58" rx="4" fill="#FDE68A" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="288" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="354" width="38" height="58" rx="4" fill="#FDE68A" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="420" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="486" width="38" height="58" rx="4" fill="#FDE68A" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="552" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="618" width="38" height="58" rx="4" fill="#FDE68A" stroke="#FB923C" strokeWidth="2" />
      <rect x="22" y="684" width="38" height="58" rx="4" fill="#FCD34D" stroke="#FB923C" strokeWidth="2" />

      <rect x="76" y="20" width="8" height="720" rx="3" fill="#1F2937" />

      <g className="highbay__carriage">
        <rect x="72" y="130" width="18" height="34" rx="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
        <rect className="highbay__fork" x="90" y="140" width="20" height="5" rx="2.5" fill="#38BDF8" />
        <rect className="highbay__fork" x="90" y="149" width="15" height="5" rx="2.5" fill="#7DD3FC" />
      </g>

      <circle cx="80" cy="34" r="3" fill="#64748B" />
      <circle cx="80" cy="726" r="3" fill="#64748B" />
    </svg>
  );
}