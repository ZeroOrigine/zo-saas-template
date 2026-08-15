import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

// THE CONTACT CHANNEL.
// zeroorigine.com has no MX record, so hello@zeroorigine.com bounced silently
// and the bounce went to the SENDER, never to us. Four public pages pointed at
// it — including the privacy page's data-deletion route and the refund route.
// Anyone exercising a legal right against this machine was writing into a void.
//
// This route replaces it with a channel the machine owns end to end: anon
// INSERT under a validated RLS policy, no service role, no mailbox to maintain,
// and a reflex on the pipeline side that reads the queue and alerts. Rule 11 —
// it works at 3 AM with zero humans, which an inbox never did.
const TOPICS = new Set(['general', 'privacy', 'refund', 'genome', 'bug']);

export async function POST(req: Request) {
  try {
    const { email, message, topic, company } = await req.json();

    // Honeypot: a real browser leaves `company` empty. Silently succeed and
    // write nothing — never tell a bot it was caught.
    if (typeof company === 'string' && company.trim() !== '') {
      return NextResponse.json({ ok: true });
    }

    const addr = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(addr) || addr.length > 254) {
      return NextResponse.json(
        { ok: false, error: 'Please enter an email address we can reply to.' },
        { status: 400 },
      );
    }

    const body = typeof message === 'string' ? message.trim() : '';
    // Mirrors the CHECK constraint exactly. The database is the authority; this
    // only exists so a person gets a sentence instead of a 500.
    if (body.length < 10 || body.length > 4000) {
      return NextResponse.json(
        { ok: false, error: 'Tell us a little more (10 to 4000 characters).' },
        { status: 400 },
      );
    }

    const kind = typeof topic === 'string' && TOPICS.has(topic) ? topic : 'general';

    const supabase = createPublicClient();
    const { error } = await supabase.from('zo_contact_messages').insert({
      email: addr,
      message: body,
      topic: kind,
      source: 'website',
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Try again.' },
      { status: 500 },
    );
  }
}
