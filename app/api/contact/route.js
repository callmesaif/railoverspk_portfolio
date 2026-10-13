import { adminDb }              from '@/lib/firebase-admin';
import { ok, err, rateLimit }   from '@/lib/api-helpers';

// POST /api/contact — public, rate limited strictly
export async function POST(req) {
  // Max 3 messages per IP per 10 minutes
  if (!rateLimit(req, 3, 10 * 60_000)) return err('Too many requests — try again later.', 429);

  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim())    return err('Name is required');
    if (!email?.trim())   return err('Email is required');
    if (!message?.trim()) return err('Message is required');

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email address');

    // Message length limit
    if (message.length > 2000) return err('Message too long (max 2000 chars)');

    await adminDb.collection('contact_messages').add({
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      subject:   subject?.trim() || '(No subject)',
      message:   message.trim(),
      read:      false,
      createdAt: new Date(),
      ip:        req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });

    return ok({ sent: true });
  } catch (e) {
    return err(e.message, 500);
  }
}
