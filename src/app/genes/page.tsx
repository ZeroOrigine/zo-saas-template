// #255 W7: the full genome registry. Home shows the latest genes; this page
// holds them all, searchable and paginated. W8's public rendering law is
// enforced in the row renderer.
import GenesAll from '@/components/GenesAll';
import { getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function GenesRegistry() {
  const state = await getSiteState();
  if (!state) {
    return (
      <main className="cert">
        <p style={{ fontFamily: 'var(--mono, monospace)' }}>
          The genome endpoint is not answering right now. Rather than show an
          invented list, this page waits. Refresh in a minute.
        </p>
      </main>
    );
  }
  return <GenesAll genes={state.genes} />;
}
