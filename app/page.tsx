import Link from "next/link";
import { redirect } from "next/navigation";
import { CollectionSummary } from "@/components/dashboard";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import "./landing.css";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "mail", title: "Daily Email Reminders", text: "Get a clear list of who is due, due today or overdue every morning." },
  { icon: "mobile", title: "Record Payments Easily", text: "Full or part payments, in just a few taps." },
  { icon: "team", title: "Add Your Team", text: "Give Full access or View only to a family member or manager." },
  { icon: "bolt", title: "Quick Setup", text: "Add your property, rooms and tenants in about two minutes." },
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "rooms", title: "Add Your Property", text: "Create your building, rooms and tenants." },
  { icon: "mail", title: "Get Daily Reminders", text: "Receive an email each morning with who's due." },
  { icon: "check", title: "Record Payments", text: "Mark full or part payments with confirmation." },
];

const FAQS = [
  { q: "Will my tenants get emails?", a: "No. Reminders go only to the owner and the team members the owner invites." },
  { q: "Do I need to install an app?", a: "No. RentRoll runs in the browser on your phone or laptop." },
  { q: "Can I record part payments?", a: "Yes. RentRoll tracks the balance left and moves the due date only when the full rent is paid." },
  { q: "Can a family member help me?", a: "Yes. Invite them with Full access, or with View only if they should see everything but change nothing." },
  { q: "Does RentRoll collect rent from tenants?", a: "No. Tenants pay you as they do today, through UPI, bank transfer or cash, and you record it in RentRoll." },
];

const SAMPLE = [
  { initials: "AS", name: "Amit Sharma", room: "Room 101", amount: "₹16,000" },
  { initials: "PK", name: "Priya Kumari", room: "Room 203", amount: "₹16,000" },
  { initials: "RV", name: "Rahul Verma", room: "Room 205", amount: "₹16,000" },
];

function PhoneMock() {
  return (
    <div className="hero-stage" aria-label="Sample RentRoll dashboard on a phone" role="img">
      <div className="lp-phone">
        <div className="lp-screen">
          <span className="logo"><Icon name="rooms" size={22} /> <span>RentRoll</span></span>
          <h2>Good morning!</h2>
          <p>Here&apos;s your rent summary</p>
          <div className="lp-stat lp-green"><span><Icon name="wallet" /></span><div><strong>₹1,20,000</strong><small>Collected this month</small></div></div>
          <div className="lp-stat lp-amber"><span><Icon name="calendar" /></span><div><strong>₹48,000</strong><small>Due today</small></div></div>
          <div className="lp-stat lp-red"><span><Icon name="alert" /></span><div><strong>₹72,000</strong><small>Overdue</small></div></div>
          <div className="lp-record">Record Payment</div>
          <div className="lp-tabs">
            <span><Icon name="rooms" size={17} />Dashboard</span>
            <span><Icon name="payments" size={17} />Payments</span>
            <span><Icon name="team" size={17} />Team</span>
            <span><Icon name="more" size={17} />Settings</span>
          </div>
        </div>
      </div>
      <span className="lp-sample">Sample data</span>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="lp-dash" role="img" aria-label="Sample RentRoll dashboard with collected, due and overdue rent, a rent due list and a collection chart">
      <div className="lp-side">
        <b>RentRoll</b>
        <span><Icon name="rooms" size={17} />Dashboard</span>
        <span><Icon name="payments" size={17} />Payments</span>
        <span><Icon name="team" size={17} />Team</span>
        <span><Icon name="more" size={17} />Settings</span>
      </div>
      <div className="lp-dash-main">
        <h3>Dashboard</h3>
        <p>Overview of your rent collection</p>
        <div className="lp-kpis">
          <div className="lp-green"><strong>₹1,20,000</strong><span>Collected</span></div>
          <div className="lp-amber"><strong>₹48,000</strong><span>Due Today</span></div>
          <div className="lp-red"><strong>₹72,000</strong><span>Overdue</span></div>
          <div className="lp-slate"><strong>₹2,40,000</strong><span>Total Expected</span></div>
        </div>
        <div className="lp-dash-grid">
          <div className="card">
            <h2>Rent Due List</h2>
            <div className="tabs">
              <span className="tab" aria-current="true">Due Today (3)</span>
              <span className="tab">Overdue (2)</span>
              <span className="tab">Upcoming (12)</span>
            </div>
            <ul className="lp-rows">
              {SAMPLE.map((row) => (
                <li key={row.name}>
                  <span className="avatar">{row.initials}</span>
                  <span className="lp-person"><strong>{row.name}</strong><small>{row.room} · Due today</small></span>
                  <b>{row.amount}</b>
                  <span className="lp-mark">Mark Paid</span>
                </li>
              ))}
            </ul>
          </div>
          <CollectionSummary collected={120000} pending={48000} overdue={72000} />
        </div>
      </div>
    </div>
  );
}

function EmailPreview() {
  return (
    <div className="lp-mail" role="img" aria-label="Sample RentRoll morning email">
      <div className="lp-mail-head">
        <span><Icon name="mail" /></span>
        <div><strong>RentRoll</strong><small>to me</small></div>
        <time>10:00 AM</time>
      </div>
      <h3>Rahul Verma, Room 205: rent 3 days late and 1 more</h3>
      <p>Today&apos;s rent update: 2 rooms need attention, ₹32,000 in total.</p>
      <div className="lp-mail-row">
        <span><strong>Rahul Verma</strong> · Room 205<br />₹16,000 · <b className="is-late">3 days late</b></span>
        <u>Mark paid</u>
      </div>
      <div className="lp-mail-row">
        <span><strong>Amit Sharma</strong> · Room 101<br />₹16,000 · <b>Due today</b></span>
        <u>Mark paid</u>
      </div>
      <u className="lp-mail-open">Open all rooms</u>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/rooms");

  return (
    <div className="landing">
      <header className="lp-header">
        <div className="lp-wrap">
          <Logo />
          <nav className="lp-links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-actions">
            <Link className="btn btn-secondary btn-small" href="/login">Log in</Link>
            <Link className="btn btn-primary btn-small lp-signup" href="/signup">Get Started Free</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="lp-wrap">
            <div className="hero-text">
              <span className="hero-pill"><Icon name="rooms" size={17} /> For Landlords &amp; PG Owners</span>
              <h1>Never miss a <br className="hero-break" />rent payment <em>again.</em></h1>
              <p className="hero-copy">Track rent, know who&apos;s due, record payments and get daily email reminders, all in one simple platform. No app install. Minimal setup. Made for Indian landlords.</p>
              <div className="hero-cta">
                <Link className="btn btn-primary" href="/signup">Get Started Free <Icon name="arrow" size={18} /></Link>
                <a className="btn btn-secondary" href="#how">See How It Works</a>
              </div>
              <ul className="hero-checks">
                <li><Icon name="check" size={16} /> Setup in 2 minutes</li>
                <li><Icon name="check" size={16} /> Daily email reminders</li>
                <li><Icon name="check" size={16} /> Works on phone &amp; laptop</li>
              </ul>
            </div>
            <PhoneMock />
          </div>
        </section>

        <section className="lp-section lp-tint" aria-labelledby="product-title">
          <div className="lp-wrap">
            <h2 id="product-title">See every room&apos;s rent at a glance</h2>
            <p className="lp-lead">Your dashboard shows who needs attention first. The names and amounts below are sample data.</p>
            <DashboardPreview />
          </div>
        </section>

        <section className="lp-section" id="features" aria-labelledby="features-title">
          <div className="lp-wrap">
            <h2 id="features-title">Everything you need to collect rent on time</h2>
            <div className="feature-grid">
              <EmailPreview />
              <div className="features">
                {FEATURES.map((f) => (
                  <article className="feature" key={f.title}>
                    <span><Icon name={f.icon} size={24} /></span>
                    <div><h3>{f.title}</h3><p>{f.text}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lp-how" id="how" aria-labelledby="how-title">
          <div className="lp-wrap">
            <div className="lp-how-title">
              <h2 id="how-title">How RentRoll works</h2>
              <p>Get started and stay on top of rent in three simple steps.</p>
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="step-icon"><Icon name={s.icon} size={24} /></span>
                  <div><h3>{s.title}</h3><p>{s.text}</p></div>
                  {i < STEPS.length - 1 && <span className="step-arrow"><Icon name="arrow" size={20} /></span>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-section" id="faq" aria-labelledby="faq-title">
          <div className="lp-wrap">
            <h2 id="faq-title">Questions landlords ask</h2>
            <div className="faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q} <Icon name="plus" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-wrap">
            <h2>Know whose rent is due, every morning.</h2>
            <Link className="btn" href="/signup">Get Started Free <Icon name="arrow" size={18} /></Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <span>© {new Date().getFullYear()} RentRoll</span>
          <Link href="/login">Log in</Link>
        </div>
      </footer>
    </div>
  );
}
