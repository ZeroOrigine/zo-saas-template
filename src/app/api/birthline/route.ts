import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Statuses that mean "a product is physically on the line right now"
const STATION_OF: Record<string, number> = {
  building: 3,
  build_complete: 3,
  qa: 4,
  qa_fix_needed: 4,
  qa_infra_error: 4,
  marketing: 5,
  deploying: 5,
  deploy_failed: 5,
};

/**
 * The Birth Line — real-time position of the product currently being born.
 * Every number here is real: zo_projects (stage), zo_cost_logs (money),
 * zo_mind_logs (the machine's actual last thought).
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const active = Object.keys(STATION_OF);

    const [{ data: projs }, { data: mindRows }] = await Promise.all([
      supabase
        .from('zo_projects')
        .select('project_id,name,status,created_at,updated_at')
        .in('status', active)
        .order('updated_at', { ascending: false })
        .limit(1),
      supabase
        .from('zo_mind_logs')
        .select('mind_name,action,output_summary,created_at,project_id')
        .order('created_at', { ascending: false })
        .limit(120),
    ]);

    const rows = mindRows ?? [];
    const hourAgo = Date.now() - 3600_000;
    const perMind: Record<string, { hour: number; last: string | null; lastAt: string | null }> = {};
    for (const r of rows) {
      const m = r.mind_name || 'unknown';
      perMind[m] ??= { hour: 0, last: null, lastAt: null };
      if (new Date(r.created_at).getTime() > hourAgo) perMind[m].hour += 1;
      if (!perMind[m].last) {
        perMind[m].last = r.output_summary || r.action || null;
        perMind[m].lastAt = r.created_at;
      }
    }

    const p = (projs ?? [])[0] ?? null;
    let inflight = null;
    if (p) {
      const { data: costRows } = await supabase
        .from('zo_cost_logs')
        .select('cost_usd')
        .eq('project_id', p.project_id);
      const cost = (costRows ?? []).reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
      const thought = rows.find((r) => r.project_id === p.project_id);
      inflight = {
        name: p.name,
        status: p.status,
        station: STATION_OF[p.status] ?? 3,
        since: p.updated_at,
        born: p.created_at,
        cost: Math.round(cost * 100) / 100,
        thought: thought ? (thought.output_summary || thought.action) : null,
        thoughtBy: thought?.mind_name ?? null,
        thoughtAt: thought?.created_at ?? null,
      };
    }

    let lastBirth = null;
    if (!inflight) {
      const { data: launched } = await supabase
        .from('zo_products')
        .select('name,created_at')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(1);
      lastBirth = (launched ?? [])[0] ?? null;
    }

    return NextResponse.json(
      { ok: true, inflight, lastBirth, perMind, at: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
