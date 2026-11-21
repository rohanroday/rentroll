"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const ITEMS = [
  { href: "/rooms", label: "Rooms", icon: "rooms" },
  { href: "/payments", label: "Payments", icon: "payments" },
  { href: "/team", label: "Team", icon: "team" },
  { href: "/more", label: "More", icon: "more" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname.startsWith(href) || (href === "/rooms" && (pathname.startsWith("/tenants") || pathname.startsWith("/pay/")));
  return (
    <nav className="nav" aria-label="Main">
      <span className="nav-brand">RentRoll</span>
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className="nav-item" aria-current={isActive(item.href) ? "page" : undefined}>
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
