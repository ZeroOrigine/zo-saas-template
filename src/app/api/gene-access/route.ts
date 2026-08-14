import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

// Genome access claim: a supporter records the email they donated with and
// their GitHub username. The machine verifies the claim against the donation
// ledger and sends the read-only invite to ZeroOrigine/zo-genes. Idempotent,
// no oracle: every well-formed claim gets the same answer.
export async function POST(req: Request) {
  try {
    const { email, github, company } = await req.json();
    if (typeof company === 'string' && company.trim() !== '') {
      return NextResponse.json({ ok: true }); // honeypot
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 });
    }
    if (typeof github !== 'string' || !/^[A-Za-z0-9-]{1,39}$/.test(github)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid GitHub username.' }, { status: 400 });
    }
    const supabase = createPublicClient();
    const { error } = await supabase.from('zo_gene_access')
      .insert({ email: email.toLowerCase().trim(), github_username: github.trim() });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
