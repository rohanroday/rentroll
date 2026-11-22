import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";
import { getContext } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getContext();
  return (
    <div className="shell">
      <Nav />
      <header className="topbar"><Logo href="/rooms" /></header>
      <main>{children}</main>
    </div>
  );
}
