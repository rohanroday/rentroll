import { Field, Submit } from "./ui";

type Values = { name?: string; phone?: string | null; email?: string | null; rent?: number; next_due?: string };

export function TenantFields({ values = {}, submit }: { values?: Values; submit: string }) {
  return (
    <>
      <Field label="Tenant name">
        <input name="name" required maxLength={60} autoComplete="off" defaultValue={values.name} />
      </Field>
      <Field label="Monthly rent (₹)">
        <input name="rent" required inputMode="numeric" pattern="[0-9,]*" defaultValue={values.rent} placeholder="10000" />
      </Field>
      <Field label="Next rent due" hint="Rent repeats on this day every month.">
        <input name="next_due" type="date" required defaultValue={values.next_due} />
      </Field>
      <Field label="Mobile number (optional)">
        <input name="phone" type="tel" inputMode="tel" autoComplete="off" defaultValue={values.phone ?? ""} placeholder="9876543210" />
      </Field>
      <Field label="Tenant email (optional)">
        <input name="email" type="email" autoComplete="off" defaultValue={values.email ?? ""} />
      </Field>
      <Submit>{submit}</Submit>
    </>
  );
}
