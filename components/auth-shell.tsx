import type { ReactNode } from "react";
import { Icon } from "./icons";
import { Logo } from "./logo";

const POINTS = ["Daily email reminders", "Full and part payments", "Works on phone and laptop"];

export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-brand">
        <Logo light />
        <p>Never miss a rent payment again.</p>
        <ul>
          {POINTS.map((point) => <li key={point}><Icon name="check" size={18} /> {point}</li>)}
        </ul>
      </div>
      <div className="auth-side">
        <section className="auth-card">
          <h1>{title}</h1>
          {children}
        </section>
      </div>
    </main>
  );
}
