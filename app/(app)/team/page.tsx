import { cancelInvite, changeRole, inviteMember, removeMember } from "@/app/actions";
import { ActionForm, Field, Submit } from "@/components/ui";
import { getContext } from "@/lib/data";

export const metadata = { title: "Team · RentRoll" };

const ROLE = { full: "Full access", view: "View only" } as const;
const ROLE_NOTE = { full: "full", view: "View only" } as const;

export default async function Team() {
  const { supabase, accountId, user, isOwner, role } = await getContext();
  const [{ data: members }, invites] = await Promise.all([
    supabase.from("members").select("user_id, email, role, created_at").eq("account_id", accountId).order("created_at"),
    isOwner
      ? supabase.from("invites").select("id, email, role, expires_at").eq("account_id", accountId).is("accepted_at", null).order("created_at")
      : Promise.resolve({ data: [] as { id: string; email: string; role: "full" | "view"; expires_at: string }[] }),
  ]);
  const { data: account } = await supabase.from("accounts").select("owner_id").eq("id", accountId).single();

  return (
    <div className="content narrow stack">
      <div className="page-head" style={{ marginBottom: -8 }}><h1>Team</h1></div>

      <ul className="list">
        {(members ?? []).map((m) => {
          const memberRole = m.role as "full" | "view";
          const owner = m.user_id === account?.owner_id;
          return (
            <li key={m.user_id}>
              <div className="row">
                <div className="row-main">
                  <p className="row-title">{m.email}{m.user_id === user.id ? " (you)" : ""}</p>
                  <p className="muted">{owner ? "Owner" : ROLE[memberRole]}</p>
                </div>
                <span className="tag">{ROLE[memberRole]}</span>
              </div>
              {isOwner && !owner && (
                <div className="inline-actions">
                  <form action={changeRole.bind(null, m.user_id, memberRole === "full" ? "view" : "full")}>
                    <button className="text-btn">Change to {memberRole === "full" ? "View only" : "Full access"}</button>
                  </form>
                  <form action={removeMember.bind(null, m.user_id)}>
                    <button className="text-btn danger">Remove</button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {isOwner ? (
        <>
          {!!invites.data?.length && (
            <section className="stack-sm">
              <h2>Waiting to join</h2>
              <ul className="list">
                {invites.data.map((i) => (
                  <li key={i.id}>
                    <div className="row">
                      <div className="row-main">
                        <p className="row-title">{i.email}</p>
                        <p className="muted">{ROLE[i.role as "full" | "view"]}</p>
                      </div>
                      <form action={cancelInvite.bind(null, i.id)}><button className="text-btn danger">Cancel</button></form>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="panel stack-sm">
            <h2>Invite someone</h2>
            <ActionForm action={inviteMember}>
              <Field label="Their email">
                <input name="email" type="email" required autoComplete="off" inputMode="email" />
              </Field>
              <Field label="What can they do?" hint="View only people see everything but can't change anything.">
                <select name="role" defaultValue="view">
                  <option value="view">View only</option>
                  <option value="full">Full access</option>
                </select>
              </Field>
              <Submit pending="Sending…">Send invite</Submit>
            </ActionForm>
          </section>
        </>
      ) : (
        <p className="notice notice-info">You have {ROLE_NOTE[role]} access. Only the owner can change the team.</p>
      )}
    </div>
  );
}
