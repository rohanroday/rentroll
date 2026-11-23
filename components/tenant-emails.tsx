"use client";

import { setTenantReminders } from "@/app/tenant-actions";
import { ActionForm, Submit } from "./ui";

export function TenantEmails({ id, name, email, enabled }: { id: string; name: string; email: string | null; enabled: boolean }) {
  let body;
  if (!email) {
    body = <p className="muted">Add {name}&apos;s email in Edit details to send rent reminders.</p>;
  } else if (enabled) {
    body = (
      <>
        <p className="muted">{name} gets a daily reminder from 5 days before rent is due until it&apos;s paid, at {email}.</p>
        <ActionForm action={setTenantReminders.bind(null, id)}>
          <input type="hidden" name="on" value="no" />
          <Submit variant="secondary" pending="Updating…">Turn off tenant emails</Submit>
        </ActionForm>
      </>
    );
  } else {
    body = (
      <>
        <p className="muted">Send {name} a reminder every morning from 5 days before rent is due until it&apos;s paid, with a private link to pay and report it.</p>
        <ActionForm action={setTenantReminders.bind(null, id)}>
          <input type="hidden" name="on" value="yes" />
          <label className="check-row">
            <input type="checkbox" name="consent" value="yes" />
            <span>{name} agreed to receive rent emails</span>
          </label>
          <Submit variant="secondary" pending="Updating…">Turn on tenant emails</Submit>
        </ActionForm>
      </>
    );
  }
  return (
    <section className="panel stack-sm">
      <h2>Tenant emails</h2>
      {body}
    </section>
  );
}
