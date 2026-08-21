// #255: The Organism. The home page is a server component that reads the
// machine's live state once (60s cache, W1) and hands the whole payload to
// the client renderer. If the machine cannot be reached the page says so
// honestly instead of inventing numbers.
import OrganismPage from '@/components/OrganismPage';
import { expandForScaleTest, getProofSummary, getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams?: { scaletest?: string };
}) {
  const [state, proof] = await Promise.all([getSiteState(), getProofSummary()]);
  if (!state) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontFamily: 'var(--mono, monospace)', maxWidth: '52ch', lineHeight: 1.8 }}>
          <div style={{ fontSize: 40 }}>0</div>
          <p>The organism&apos;s state endpoint is not answering right now. Rather than show you
            an invented number, this page waits. Refresh in a minute.</p>
        </div>
      </main>
    );
  }
  // #255 W2 acceptance rig: ?scaletest=N appends clearly-labeled synthetic
  // rows so the scale rails can be exercised on a preview. Never stored.
  const n = Number(searchParams?.scaletest || 0);
  const finalState = n > 0 && n <= 2000 ? expandForScaleTest(state, n) : state;
  return <OrganismPage state={finalState} proof={proof} />;
}
