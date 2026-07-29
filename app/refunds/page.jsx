import Nav from '@/components/Nav';
import Link from 'next/link';

export const metadata = {
  title: 'Pakistan Railways Refund Policy — Ticket Cancellation Guide | RaiLoversPK',
  description: 'Official Pakistan Railways ticket refund and cancellation policy — deduction slabs for POS counter and online/RABTA tickets, verified against official PR circular.',
};

export default function RefundsPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Traveler's Guide</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          Refund & <span style={{ color: 'var(--accent)' }}>Cancellation</span> Policy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', maxWidth: '560px', lineHeight: 1.7 }}>
          A plain-language guide to how Pakistan Railways handles ticket cancellations and refunds — for both counter (POS) and online/RABTA bookings.
        </p>
      </div>

      <article className="container" style={{ maxWidth: '780px', padding: '0 2.5rem 5rem' }}>
        <div style={DIVIDER} />

        {/* Verified badge */}
        <div style={{ background: 'rgba(63,202,122,0.08)', border: '1px solid rgba(63,202,122,0.25)', borderRadius: '16px', padding: '16px 20px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3fca7a', marginBottom: '6px' }}>
            ✓ Officially Referenced
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            This policy is verified against an official Pakistan Railways circular — <strong style={{ color: 'var(--text)' }}>No.573-KAC/6-RTA/Rabta/2023-2024</strong>, issued by the Divisional Office Karachi (dated January 28, 2025), referencing CCM Office Lahore letter No.180-MC/RABTA/Refund Policy dated 11/05/2024.
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255,180,50,0.08)', border: '1px solid rgba(255,180,50,0.25)', borderRadius: '16px', padding: '16px 20px', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffb432', marginBottom: '6px' }}>
            ⚠ Important Note
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Policies can be revised by Pakistan Railways at any time. Always confirm the current policy at your booking counter or on the{' '}
            <a href="https://www.pakrail.gov.pk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>official Pakistan Railways website</a>{' '}
            before relying on it. RaiLoversPK is an independent content platform and is not affiliated with Pakistan Railways.
          </p>
        </div>

        {/* POS Tickets */}
        <Section title="POS (Counter) Tickets — Before Departure">
          For tickets bought at Point of Sale counters, refunds follow this tiered deduction schedule based on how early you cancel:

          <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
            <table style={TABLE}>
              <thead>
                <tr>
                  <th style={TH}>Cancelled Before Departure</th>
                  <th style={TH}>Refund You Receive</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={TD}>48 hours or more</td><td style={{...TD, color: '#3fca7a', fontWeight: 700}}>90%</td></tr>
                <tr><td style={TD}>24 to 48 hours</td><td style={{...TD, color: 'var(--accent)', fontWeight: 700}}>80%</td></tr>
                <tr><td style={TD}>Within 24 hours</td><td style={{...TD, color: '#ffb432', fontWeight: 700}}>70%</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* POS after departure */}
        <Section title="POS Tickets — After Departure">
          <ul style={LIST}>
            <li>If cancelled <strong style={{ color: 'var(--text)' }}>within 2 hours after</strong> the train's departure, you can still receive a <strong style={{ color: '#3fca7a' }}>50% refund</strong>.</li>
            <li>If the train is <strong style={{ color: 'var(--text)' }}>cancelled or delayed by more than 6 hours</strong>, passengers are entitled to a <strong style={{ color: '#3fca7a' }}>full refund</strong>.</li>
            <li>Refunds for POS tickets are only issued at the <strong style={{ color: 'var(--text)' }}>same counter</strong> where the ticket was purchased.</li>
          </ul>
        </Section>

        {/* Online/RABTA Tickets */}
        <Section title="Online / RABTA App Tickets — Before Departure">
          Online tickets follow the <strong style={{ color: 'var(--text)' }}>same percentage slabs</strong> as counter tickets, but the process and after-departure rules are different:

          <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
            <table style={TABLE}>
              <thead>
                <tr>
                  <th style={TH}>Cancelled Before Departure</th>
                  <th style={TH}>Refund You Receive</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={TD}>48 hours or more</td><td style={{...TD, color: '#3fca7a', fontWeight: 700}}>90%</td></tr>
                <tr><td style={TD}>24 to 48 hours</td><td style={{...TD, color: 'var(--accent)', fontWeight: 700}}>80%</td></tr>
                <tr><td style={TD}>Within 24 hours</td><td style={{...TD, color: '#ffb432', fontWeight: 700}}>70%</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Online / RABTA Tickets — Key Differences From POS">
          <ul style={LIST}>
            <li><strong style={{ color: '#f97070' }}>No refund</strong> is given once the train has departed — unlike POS tickets which still get 50% within 2 hours.</li>
            <li>Cancellation is <strong style={{ color: '#f97070' }}>not allowed</strong> when departure is less than <strong style={{ color: 'var(--text)' }}>1 hour 30 minutes</strong> away.</li>
            <li>Refunds are returned <strong style={{ color: 'var(--text)' }}>only</strong> through the original payment method used at booking (card, wallet, etc.) — cannot be claimed in cash at a counter.</li>
            <li>These same rules apply to tickets purchased via TVM (Ticket Vending Machines).</li>
          </ul>
        </Section>

        {/* How to claim - Counter */}
        <Section title="Claiming a POS Refund — What You Need">
          <ul style={LIST}>
            <li>Your <strong style={{ color: 'var(--text)' }}>original ticket</strong>.</li>
            <li>A <strong style={{ color: 'var(--text)' }}>copy of your CNIC</strong>.</li>
            <li>You'll receive a cancellation slip along with your refund — one copy is retained by the reservation staff and attached to their refund register.</li>
          </ul>
        </Section>

        <div style={DIVIDER} />

        {/* CTA */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.7 }}>
            Planning a journey? Check out our train scorecards for real ratings on punctuality, comfort, and more.
          </div>
          <Link href="/reviews" className="btn-primary" style={{ display: 'inline-flex' }}>
            View Train Scorecards →
          </Link>
        </div>

      </article>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.25rem' }}>
      <h2 style={SEC_TITLE}>{title}</h2>
      <div style={BODY}>{children}</div>
    </div>
  );
}

const DIVIDER   = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const SEC_TITLE = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.75rem', color: 'var(--text)' };
const BODY      = { fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.7)' };
const LIST      = { paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyle: 'disc' };
const TABLE     = { width: '100%', borderCollapse: 'collapse', minWidth: '380px' };
const TH        = { textAlign: 'left', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--bg2)', padding: '10px 14px', border: '1px solid var(--border)' };
const TD        = { fontSize: '13px', padding: '10px 14px', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.75)' };