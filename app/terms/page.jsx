import Nav from '@/components/Nav';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — RaiLoversPK',
  description: 'Terms of Service for RaiLoversPK — Pakistan Railway Vlogger & Filmmaker.',
};

const LAST_UPDATED = 'June 23, 2026';

export default function TermsPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Header */}
      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Legal</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          TERMS OF <span style={{ color: 'var(--accent)' }}>SERVICE</span>
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Last Updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Content */}
      <article className="container" style={{ maxWidth: '780px', padding: '0 2.5rem 5rem' }}>
        <div style={DIVIDER} />

        <Section title="1. Acceptance of Terms">
          By accessing and using railoverspk.com (the "Website"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Website.
        </Section>

        <Section title="2. About RaiLoversPK">
          RaiLoversPK is a Pakistan Railways content platform providing train reviews, journey vlogs, and travel guides. All content is created for informational and entertainment purposes only.
        </Section>

        <Section title="3. Use of Content">
          <ul style={LIST}>
            <li>All content on this Website — including text, images, videos, and graphics — is the property of RaiLoversPK and is protected by applicable copyright laws.</li>
            <li>You may not reproduce, distribute, or use our content for commercial purposes without prior written permission.</li>
            <li>You may share links to our content and quote brief excerpts for non-commercial purposes with proper attribution.</li>
            <li>YouTube videos embedded on this site are subject to YouTube's Terms of Service.</li>
          </ul>
        </Section>

        <Section title="4. User Conduct">
          When using our Website, you agree not to:
          <ul style={LIST}>
            <li>Use the Website for any unlawful purpose or in violation of any regulations.</li>
            <li>Attempt to gain unauthorised access to any part of the Website or its backend systems.</li>
            <li>Submit false, misleading, or harmful content via our contact form.</li>
            <li>Manipulate or attempt to manipulate poll results through automated means.</li>
            <li>Scrape, crawl, or systematically extract data from the Website without permission.</li>
          </ul>
        </Section>

<Section title="6. Contact Form">
          By submitting a message through our contact form, you agree that:
          <ul style={LIST}>
            <li>The information you provide is accurate and truthful.</li>
            <li>You are not submitting spam, unsolicited commercial messages, or harmful content.</li>
            <li>We may use your contact details to respond to your enquiry.</li>
          </ul>
        </Section>

        <Section title="7. Accuracy of Information">
          While we strive to provide accurate and up-to-date information about Pakistan Railways, train fares, schedules, and routes — all information is provided for general guidance only. Fares, timings, and routes are subject to change by Pakistan Railways. Always verify current information with official Pakistan Railways sources before travelling.
        </Section>

        <Section title="8. Third-Party Links">
          Our Website may contain links to third-party websites, including YouTube, Pakistan Railways official website, and other platforms. We are not responsible for the content, privacy practices, or terms of these external sites. Visiting them is at your own risk.
        </Section>

        <Section title="9. Disclaimer of Warranties">
          The Website is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not warrant that the Website will be uninterrupted, error-free, or free of viruses or harmful components.
        </Section>

        <Section title="10. Limitation of Liability">
          To the fullest extent permitted by law, RaiLoversPK shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Website or reliance on any content published herein.
        </Section>

        <Section title="11. Changes to Terms">
          We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the Website. Your continued use of the Website following any changes constitutes your acceptance of the revised terms.
        </Section>

        <Section title="12. Governing Law">
          These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Pakistan.
        </Section>

        <Section title="13. Contact Us">
          If you have any questions about these Terms of Service, please contact us via our <Link href="/contact" style={INLINE_LINK}>Contact page</Link> or email hello@railoverspk.com.
        </Section>

        <div style={DIVIDER} />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={BACK_BTN}>← Back to Home</Link>
          <Link href="/privacy" style={BACK_BTN}>Privacy Policy →</Link>
        </div>
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
