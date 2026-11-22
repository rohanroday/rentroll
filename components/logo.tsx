import Link from "next/link";

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className={`logo${light ? " logo-light" : ""}`} aria-label="RentRoll home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 15 16 5l12 10" />
        <path d="M8 12v15h16V12" />
        <path d="M13 19h6M13 23h6" className="logo-mark" />
      </svg>
      <span>RentRoll</span>
    </Link>
  );
}
