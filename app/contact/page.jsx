'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import emailjs from '@emailjs/browser';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const INFO = [
  { icon: '✉', label: 'Email',    value: 'pakrailzone01@gmail.com' },
  { icon: '📍', label: 'Based In', value: 'Pakistan'              },
  { icon: '▶', label: 'YouTube',  value: '@railoverspkofficial'   },
];

const SOCIALS = [
  { label: 'YouTube',   href: 'https://www.youtube.com/@railoverspkofficial' },
  { label: 'Instagram', href: 'https://instagram.com/realinventivecadet'},
  { label: 'Twitter',   href: 'https://twitter.com/railoverspk'              },
];

export default function ContactPage() {
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Firebase mein save karo
      await addDoc(collection(db, 'contact_messages'), {
        name:      form.name,
        email:     form.email,
        subject:   form.subject,
        message:   form.message,
        timestamp: serverTimestamp(),
      });

      // 2. EmailJS se email bhejo
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject,
          message:    form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      );

      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  }

  const INPUT = {
    width: '100%', background: 'var(--bg3)',
    border: '1px solid var(--border2)', borderRadius: '12px',
    padding: '13px 16px', color: 'var(--text)',
    fontFamily: "'Inter', sans-serif", fontSize: '13px',
    fontWeight: 500, outline: 'none', transition: 'border-color 0.2s',
  };

  const LABEL = {
    display: 'block', fontSize: '10px', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: '8px',
  };

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      <div className="container animate-in" style={{ padding: '4.5rem 2.5rem 3rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Let's Connect</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 9vw, 7rem)', lineHeight: 0.9, textTransform: 'uppercase' }}>
          GET IN <span style={{ color: 'var(--accent)' }}>TOUCH</span>
        </h1>
      </div>

      <div className="container rl-contact-grid" style={{ padding: '0 2.5rem 5rem' }}>

        {/* Left */}
        <div>
          <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '2rem' }}>
            Whether you're a brand looking to collaborate, a fellow creator, or just a train enthusiast — drop a message. Always happy to connect.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {INFO.map(({ icon, label, value }) => (
              <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '18px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={LABEL}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '2rem', flexWrap: 'wrap' }}>
            {SOCIALS.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 16px', borderRadius: '12px', border: '1px solid var(--border2)', background: 'var(--bg2)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg2)'; }}
              >{label}</a>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '28px', padding: '2.5rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✓</div>
              <h2 className="font-display" style={{ fontSize: '2rem', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                Message Sent!
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                Thanks for reaching out. I'll get back to you within 24 hours.
              </p>
              <button onClick={() => setSent(false)} className="btn-ghost" style={{ marginTop: '1.5rem' }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-display" style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Send a Message
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2rem' }}>
                I typically respond within 24 hours.
              </p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#f97070', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={LABEL} htmlFor="name">Your Name</label>
                  <input id="name" name="name" type="text" required placeholder="Full name" value={form.name} onChange={handleChange} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL} htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required placeholder="your@email.com" value={form.email} onChange={handleChange} style={INPUT} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={LABEL} htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" required placeholder="Collaboration, sponsorship, general enquiry..." value={form.subject} onChange={handleChange} style={INPUT} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={LABEL} htmlFor="message">Message</label>
                <textarea id="message" name="message" required rows={5} placeholder="Tell me about your project or idea..." value={form.message} onChange={handleChange} style={{ ...INPUT, resize: 'vertical', minHeight: '120px' }} />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}