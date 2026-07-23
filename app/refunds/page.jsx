import Nav from '@/components/Nav';
import Link from 'next/link';

export const metadata = {
  title: 'Pakistan Railways Refund Policy — Ticket Cancellation Guide | RaiLoversPK',
  description: 'Complete guide to Pakistan Railways ticket refund and cancellation policy — deduction slabs, how to claim refunds for online and counter tickets, and delay compensation rules.',
};

export default function RefundsPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Header */}
      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Traveler's Guide</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          Refund & <span style={{ color: 'var(--accent)' }}>Cancellation</span> Policy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', maxWidth: '560px', lineHeight: 1.7 }}>
          A plain-language guide to how Pakistan Railways handles ticket cancellations and refunds — for both counter (POS) and online/app bookings.
        </p>
      </div>

      {/* Content */}
      <article className="container" style={{ maxWidth: '780px', padding: '0 2.5rem 5rem' }}>
        <div style={DIVIDER} />

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255,180,50,0.08)', border: '1px solid rgba(255,180,50,0.25)', borderRadius: '16px', padding: '16px 20px', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffb432', marginBottom: '6px' }}>
            ⚠ Important Note
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            This page summarizes Pakistan Railways' publicly stated refund policy for general guidance only. Rules can change without notice — always confirm the current policy at your booking counter or on the{' '}
            <a href="https://www.pakrail.gov.pk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>official Pakistan Railways website</a>{' '}
            before relying on it. RaiLoversPK is an independent content platform and is not affiliated with Pakistan Railways.
          </p>
        </div>

        {/* Section: Deduction Slabs */}
        <Section title="Cancellation Deduction Slabs">
          Pakistan Railways uses a tiered deduction system — the closer you cancel to departure time, the more is deducted from your refund. This applies to both counter (Point of Sale) and online/app bookings made through the Pak Rail Mobile app or website.

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
                <tr><td style={TD}>Within ~90 minutes / 2 hours</td><td style={{...TD, color: '#f97070', fontWeight: 700}}>50%</td></tr>
                <tr><td style={TD}>After train departs</td><td style={{...TD, color: '#f97070', fontWeight: 700}}>No refund</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section: Delay Compensation */}
        <Section title="If Your Train Is Delayed">
          If a train is cancelled or delayed by <strong style={{ color: 'var(--text)' }}>6 hours or more</strong>, passengers are generally entitled to a full refund with no deductions. To claim this, you typically need to submit a written application and get it countersigned by the station master confirming the delay — this can usually be sent to the CCM (Chief Commercial Manager) office.
        </Section>

        {/* Section: How to claim - Counter */}
        <Section title="Claiming a Refund — Counter (POS) Tickets">
          <ul style={LIST}>
            <li>Refunds for counter-purchased tickets are only issued at the <strong style={{ color: 'var(--text)' }}>same counter</strong> where the ticket was bought.</li>
            <li>Bring your <strong style={{ color: 'var(--text)' }}>original ticket</strong> and a <strong style={{ color: 'var(--text)' }}>copy of your CNIC</strong>.</li>
            <li>You'll receive a cancellation slip along with your refund.</li>
            <li>No refund will be processed without a valid cancellation confirmation from Pakistan Railways.</li>
          </ul>
        </Section>

        {/* Section: How to claim - Online */}
        <Section title="Claiming a Refund — Online / App Bookings">
          <ul style={LIST}>
            <li>Open the Pak Rail Mobile app or website and log in with the mobile number used for booking.</li>
            <li>Go to your booking history and select the ticket you want to cancel.</li>
            <li>The system shows your exact refund amount — including all deductions — before you confirm.</li>
            <li>Refunds are returned via the same payment method used (card, JazzCash, EasyPaisa, etc.), subject to your bank/wallet's own processing time.</li>
          </ul>
        </Section>

        {/* Section: Non-refundable */}
        <Section title="What's Never Refundable">
          <ul style={LIST}>
            <li>Per-seat insurance and Dam Fund charges are deducted automatically and are non-refundable.</li>
            <li>Service charges applied by your payment provider (card network, mobile wallet) are also non-refundable.</li>
            <li>Tickets cannot be cancelled once the train chart has been prepared for departure.</li>
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
