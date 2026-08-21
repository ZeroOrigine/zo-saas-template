// #255 W1: the ONE payload the whole site renders from. Server-side fetch of
// the machine's live state endpoint, cached 60 seconds. A new birth appears
// on the site with zero frontend changes because nothing here is hand-written.
// If the machine cannot be reached the page renders its honest empty states;
// no number is ever invented to fill a cell.

const RAILWAY = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

export interface Vital { k: string; v: number; prefix?: string; cls?: string; s: string }
export interface SiteProduct {
  born: string; name: string; url: string; cat: string; slug: string;
  tagline: string; cost: string; stamp: [string, string];
}
export interface Grave { died: string; name: string; cause: string; forward: string }
export interface Gene { slug: string; d: string; status: [string, string] }
export interface BookLine { p: string; e: string; d: string; c: string; n: string }
export interface SiteState {
  generated_at: string;
  vitals: Vital[];
  products: SiteProduct[];
  graveyard: Grave[];
  genes: Gene[];
  books: BookLine[];
}
export interface ProofSummary {
  days_proven: number;
  days_anchored: number;
  latest: { day: string; chained_root: string; leaf_count: number; solana_sig: string | null; solana_explorer: string | null } | null;
}

export async function getSiteState(): Promise<SiteState | null> {
  try {
    const r = await fetch(`${RAILWAY}/site/state`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as SiteState;
  } catch {
    return null;
  }
}

export async function getProofSummary(): Promise<ProofSummary | null> {
  // #255 W4: graceful absence. Before the proof layer anchors (or if it is
  // ever unreachable) the Books folio simply shows no stamp.
  try {
    const r = await fetch(`${RAILWAY}/books/proof-summary`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as ProofSummary;
  } catch {
    return null;
  }
}

// #255 W2 acceptance rig: `?scaletest=500` expands the REAL payload with
// clearly-labeled synthetic rows so the scale rails can be exercised on a
// preview. Inert without the query param; nothing synthetic is ever stored.
export function expandForScaleTest(state: SiteState, n: number): SiteState {
  const cats = ['compliance', 'finance', 'education', 'business', 'productivity', 'transport'];
  const fake: SiteProduct[] = Array.from({ length: n }, (_, i) => ({
    born: '2026-01-01',
    name: `ScaleTest Product ${i + 1}`,
    url: '#',
    cat: cats[i % cats.length],
    slug: `scaletest-${i + 1}`,
    tagline: 'synthetic row for the scale drill',
    cost: 'synthetic',
    stamp: ['hold', 'scale test'],
  }));
  return { ...state, products: [...state.products, ...fake] };
}
