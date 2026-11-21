import { Nav } from "@/components/nav";
import { getContext } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getContext();
  return (
    <div className="shell">
      <Nav />
      <main>{children}</main>
    </div>
  );
}
