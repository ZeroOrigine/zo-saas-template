// #255 W3: the birth certificate. One template, rendered from the registry
// payload, so every product ever born (and every one yet to be born) gets a
// page with zero hand-written markup. Unknown slugs 404 honestly.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteState } from '@/lib/siteState';
import '@/app/organism.css';

export const dynamic = 'force-dynamic';

export default async function ProductCertificate({
  params,
}: {
  params: { slug: string };
}) {
  const state = await getSiteState();
  const p = state?.products.find((x) => x.slug === params.slug);
  if (!p) notFound();

  return (
    <main className="cert" style={{ opacity: 1 }}>
      <Link className="back" href="/">back to the organism</Link>
      <div className="frame">
        <div className="kicker">Certificate of birth · ZeroOrigine registry</div>
        <h1>{p.name}</h1>
        {p.tagline && <p className="tag">{p.tagline}</p>}
        <dl>
          <dt>Born</dt><dd>{p.born}</dd>
          <dt>Category</dt><dd>{p.cat}</dd>
          <dt>Cost of birth</dt>
          <dd>{p.cost === 'pre-attribution'
            ? 'pre-attribution (recorded in the aggregate books)' : p.cost}</dd>
          <dt>Status</dt>
          <dd><span className={'stamp ' + p.stamp[0]}>{p.stamp[1]}</span></dd>
          <dt>Front door</dt>
          <dd>{p.stamp[1].includes('drilled')
            ? 'walked by the machine on the live site: signup, login, reset, core action, checkout'
            : 'launched; the walk-the-front-door drill applies to births from August 2026 onward'}</dd>
        </dl>
        {p.url && p.url !== '#' && (
          <a className="visit" href={p.url} rel="noopener noreferrer">Visit {p.name}</a>
        )}
      </div>
      <p className="caveat" style={{ marginTop: 18 }}>
        This certificate is rendered from the machine&apos;s own registry. Nothing on it is
        hand-written; if a number is missing, it is because the ledger does not hold it.
      </p>
    </main>
  );
}
