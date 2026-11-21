import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  rooms: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-5h4v5" /></>,
  payments: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9.5 8h5M9.5 12h5" /></>,
  team: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c.6-3.8 3-5.5 6-5.5s5.4 1.7 6 5.5M15.5 5a3.5 3.5 0 0 1 0 6.5M17.5 15c1.8.6 3 2.2 3.5 5" /></>,
  more: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <><path d="M12 4 2.8 20h18.4z" /><path d="M12 10v4.5M12 17.5v.01" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="m14.5 5-7 7 7 7" />,
  phone: <path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />,
};

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
