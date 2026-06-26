import Nav from '@/components/Nav';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — RaiLoversPK',
  description: 'Privacy Policy for RaiLoversPK — Pakistan Railway Vlogger & Filmmaker.',
};

const LAST_UPDATED = 'June 23, 2026';

export default function PrivacyPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Header */}
      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Legal</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          PRIVACY <span style={{ color: 'var(--accent)' }}>POLICY</span>
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Last Updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Content */}
      <article className="container" style={{ maxWidth: '780px', padding: '0 2.5rem 5rem' }}>
        <div style={DIVIDER} />

        <Section title="1. Introduction">
          Welcome to RaiLoversPK ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website at railoverspk.com.
        </Section>

        <Section title="2. Information We Collect">
          We may collect the following types of information:
          <ul style={LIST}>
            <li><strong>Contact Information:</strong> When you submit our contact form, we collect your name, email address, and message content.</li>
            <li><strong>Usage Data:</strong> We may collect information about how you interact with our website, including pages visited, time spent, and links clicked.</li>
            <li><strong>Poll Responses:</strong> When you participate in community polls, your vote is recorded anonymously in our database.</li>
            <li><strong>Cookies:</strong> We use localStorage to remember your poll votes so you do not vote more than once per poll.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          We use the information we collect to:
          <ul style={LIST}>
            <li>Respond to your messages and enquiries submitted via the contact form.</li>
            <li>Display community poll results and maintain voting integrity.</li>
            <li>Improve and maintain our website.</li>
            <li>Analyse how visitors use our site to improve the user experience.</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          We use the following third-party services which may collect data independently:
          <ul style={LIST}>
            <li><strong>Firebase (Google):</strong> We use Firebase Firestore for our database and Firebase Authentication for admin access. Google's Privacy Policy applies.</li>
            <li><strong>YouTube:</strong> Our site embeds YouTube videos. YouTube may collect data as per Google's Privacy Policy.</li>
            <li><strong>ImgBB:</strong> Cover images are hosted via ImgBB. Their privacy policy applies to uploaded images.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          Contact form submissions are stored in our Firebase database and retained until manually deleted by the administrator. Poll votes are stored anonymously without any personally identifiable information.
        </Section>

        <Section title="6. Your Rights">
          You have the right to:
          <ul style={LIST}>
            <li>Request access to the personal data we hold about you.</li>
            <li>Request deletion of your personal data.</li>
            <li>Withdraw consent at any time where we rely on consent to process your data.</li>
          </ul>
          To exercise any of these rights, please contact us via our <Link href="/contact" style={INLINE_LINK}>Contact page</Link>.
        </Section>

        <Section title="7. Children's Privacy">
          Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page. Continued use of the website after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="9. Contact Us">
          If you have any questions about this Privacy Policy, please reach out via our <Link href="/contact" style={INLINE_LINK}>Contact page</Link> or email us at hello@railoverspk.com.
        </Section>

        <div style={DIVIDER} />
        <Link href="/" style={BACK_BTN}>← Back to Home</Link>
      </article>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={SEC_TITLE}>{title}</h2>
      <div style={BODY}>{children}</div>
    </div>
  );
}

const DIVIDER    = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const SEC_TITLE  = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', color: 'var(--text)' };
const BODY       = { fontSize: '14px', lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', fontWeight: 400 };
const LIST       = { paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const INLINE_LINK= { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 };
const BACK_BTN   = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
