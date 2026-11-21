import type { ReactNode } from "react";

export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-brand">
        <span className="auth-logo">RentRoll</span>
        <p>Know whose rent is due, every morning.</p>
      </div>
      <section className="auth-card">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
