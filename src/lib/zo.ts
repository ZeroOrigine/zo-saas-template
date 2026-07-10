import { createAdminClient } from '@/lib/supabase/admin';

// Server-side data layer for Mission Control. Every number on the site comes
// through here — from the same database the Minds write to. No number is ever
// invented; if a query fails we return null and the UI renders nothing.

export interface RegistryRow {
  project_id: string;
  name: string;
  status: string;
  category: string | null;
  created_at: string;
  cost_usd: number;
  url: string | null;
}

const FRIENDLY: Record<string, { mind: string; line: string }> = {
  research_trigger: { mind: 'Research Mind', line: 'went hunting for problems worth solving' },
  research_complete: { mind: 'Research Mind', line: 'finished discovering problems worth solving' },
  evaluation_complete: { mind: 'Research Mind B', line: 'scored ideas for viability — GO / NO-GO' },
  idea_needs_fixes: { mind: 'Ethics Mind', line: 'sent an idea back with required fixes' },
  approval_needed: { mind: 'Ecosystem', line: 'asked the founder to approve a new idea' },
  human_approved: { mind: 'Founder', line: 'approved an idea for building' },
  build_complete: { mind: 'Builder Mind', line: 'finished building — all steps complete' },
  build_failed: { mind: 'Builder Mind', line: 'hit a wall — build failed, learnings stored' },
  qa_fix_needed: { mind: 'QA Mind', line: 'found issues and sent them back to the Builder' },
  qa_passed: { mind: 'QA Mind', line: 'passed the product through quality review' },
  qa_failed: { mind: 'QA Mind', line: 'rejected the build — quality bar not met' },
  marketing_complete: { mind: 'Marketing Mind', line: 'prepared the launch story' },
  deploy_complete: { mind: 'Deploy', line: 'shipped to production' },
  product_launched: { mind: 'Ecosystem', line: 'launched a new product' },
};

export function friendlyEvent(type: string) {
  return FRIENDLY[type] ?? null;
}

export async function getHomeData() {
  try {
    const supabase = createAdminClient();
    const [products, projects, costs, events] = await Promise.all([
      supabase.from('zo_products').select('slug,name,tagline,status,url,icon,sort_order').order('sort_order'),
      supabase.from('zo_projects').select('project_id,name,status,created_at'),
      supabase.from('zo_cost_logs').select('cost_usd,project_id,created_at'),
      supabase.from('pipeline_events').select('event_type,project_id,created_at')
        .in('event_type', Object.keys(FRIENDLY)).order('created_at', { ascending: false }).limit(10),
    ]);
    const costRows = costs.data ?? [];
    const totalSpend = costRows.reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
    const live = (products.data ?? []).filter((p) => p.status === 'live');
    const allProjects = projects.data ?? [];
    const dropped = allProjects.filter((p) => p.status === 'dropped').length;

    const feed = (events.data ?? []).map((e) => ({
      ...FRIENDLY[e.event_type],
      product: (e.project_id || '').replace(/^zo-/, '').replace(/^RA-.*/, 'new ideas') || null,
      at: e.created_at,
    }));

    return {
      liveCount: live.length,
      totalProjects: allProjects.length,
      droppedCount: dropped,
      totalSpend,
      products: live,
      feed,
      apiCalls: costRows.length,
    };
  } catch {
    return null;
  }
}

export async function getRegistry(): Promise<RegistryRow[] | null> {
  try {
    const supabase = createAdminClient();
    const [projects, costs, products] = await Promise.all([
      supabase.from('zo_projects').select('project_id,name,status,category,created_at').order('created_at', { ascending: false }),
      supabase.from('zo_cost_logs').select('project_id,cost_usd'),
      supabase.from('zo_products').select('slug,url,status'),
    ]);
    const costBy: Record<string, number> = {};
    for (const r of costs.data ?? []) {
      const k = r.project_id || '';
      costBy[k] = (costBy[k] || 0) + (Number(r.cost_usd) || 0);
    }
    const urlBy: Record<string, string> = {};
    for (const p of products.data ?? []) {
      if (p.status === 'live' && p.url) urlBy[`zo-${p.slug}`] = p.url;
    }
    return (projects.data ?? []).map((p) => ({
      project_id: p.project_id,
      name: p.name,
      status: p.status,
      category: p.category,
      created_at: p.created_at,
      cost_usd: Math.round((costBy[p.project_id] || 0) * 100) / 100,
      url: urlBy[p.project_id] ?? null,
    }));
  } catch {
    return null;
  }
}

export async function getStory(slug: string) {
  try {
    const supabase = createAdminClient();
    const pid = `zo-${slug}`;
    const [proj, events, costs] = await Promise.all([
      supabase.from('zo_projects').select('project_id,name,status,category,created_at,research_score').eq('project_id', pid).limit(1),
      supabase.from('pipeline_events').select('event_type,created_at').eq('project_id', pid)
        .in('event_type', Object.keys(FRIENDLY)).order('created_at', { ascending: true }).limit(200),
      supabase.from('zo_cost_logs').select('cost_usd,workflow').eq('project_id', pid),
    ]);
    if (!proj.data?.length) return null;
    const p = proj.data[0];
    const costRows = costs.data ?? [];
    const totalCost = costRows.reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
    const milestones = (events.data ?? []).map((e) => ({
      ...FRIENDLY[e.event_type],
      type: e.event_type,
      at: e.created_at,
    }));
    return {
      name: p.name,
      status: p.status,
      category: p.category,
      born: p.created_at,
      score: p.research_score,
      totalCost: Math.round(totalCost * 100) / 100,
      calls: costRows.length,
      milestones,
    };
  } catch {
    return null;
  }
}
