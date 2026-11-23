"use client";

import { setTenantReminders } from "@/app/tenant-actions";
import { ActionForm, Submit } from "./ui";

export function TenantEmails({ id, name, email, enabled, optedOut }: { id: string; name: string; email: string | null; enabled: boolean; optedOut: boolean }) {
  let body;
  if (!email) {
    body = <p className="muted">Add {name}&apos;s email in Edit details to send rent reminders.</p>;
  } else if (optedOut) {
    body = <p className="muted">{name} turned off rent emails. Only they can turn them back on, from their rent link.</p>;
  } else if (enabled) {
    body = (
      <>
        <p className="muted">{name} gets a rent reminder and a private payment link at {email}.</p>
        <ActionForm action={setTenantReminders.bind(null, id)}>
          <input type="hidden" name="on" value="no" />
          <Submit variant="secondary" pending="Updating…">Turn off tenant emails</Submit>
        </ActionForm>
      </>
    );
  } else {
    body = (
      <>
        <p className="muted">Send {name} a reminder from 3 days before rent is due, with a private link to pay and report it.</p>
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
