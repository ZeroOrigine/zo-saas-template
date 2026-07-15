'use client';

import { useEffect, useRef, useState } from 'react';

const STATIONS = ['Research', 'Evaluation', 'Ethics', 'Builder', 'QA', 'Launch'];

interface Inflight {
  name: string; status: string; station: number; halted: boolean;
  born: string; cost: number; thought: string | null; thoughtBy: string | null;
}
interface Birthline {
  ok: boolean;
  inflight: Inflight | null;
  lastBirth?: { name: string; created_at: string } | null;
}

function elapsed(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}m ${s % 60}s`;
}

/**
 * The machine, thinking — live. Polls /api/birthline (sanitized server-side).
 * Idle is shown honestly: no fake activity, ever.
 */
export default function MachinePanel() {
  const [d, setD] = useState<Birthline | null>(null);
  const [lines, setLines] = useState<{ by: string; text: string }[]>([]);
  const [, tick] = useState(0);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/birthline', { cache: 'no-store' });
        const j = (await r.json()) as Birthline;
        if (!j?.ok) return;
        setD(j);
        const t = j.inflight?.thought;
        if (t && !seen.current.has(t)) {
          seen.current.add(t);
          setLines((old) => [...old.slice(-5), { by: j.inflight?.thoughtBy ?? 'a Mind', text: t }]);
        }
      } catch { /* keep last known — never invent activity */ }
    };
    load();
    const p = setInterval(load, 25000);
    const c = setInterval(() => tick((n) => n + 1), 1000);
    return () => { clearInterval(p); clearInterval(c); };
  }, []);

  const f = d?.inflight ?? null;

  return (
    <div className="mth-wrap" aria-label="The machine, thinking — live">
      <div className="mth">
        <div className="mth-head">
          <span><span className={`mth-dot${f && !f.halted ? ' on' : ''}`}></span> THE MACHINE IS THINKING</span>
          <span className="mth-tag">UNEDITED · LIVE</span>
        </div>
        <div className="mth-body">
          {f ? (
            lines.length ? (
              lines.map((l, i) => <p key={i}><b>{l.by}:</b> {l.text}</p>)
            ) : (
              <p className="mth-idle">
                {f.name} is on the line — the Mind at work is emitting source code, not sentences,
                at this exact second. The stage and the money below are real.
              </p>
            )
          ) : (
            <p className="mth-idle">
              The line is idle — the factory pulls its next idea when the backlog runs low.
              {d?.lastBirth ? ` Last birth: ${d.lastBirth.name}.` : ''} When a Mind starts thinking,
              its actual thoughts stream here, unedited.
            </p>
          )}
        </div>
        <div className="mth-foot">
          <span><i>ON THE LINE</i><b className="mth-mono">{f ? elapsed(f.born) : '—'}</b></span>
          <span><i>COMPUTE SPENT</i><b className="mth-mono">{f ? `$${f.cost.toFixed(2)}` : '—'}</b></span>
          <span><i>HUMANS INVOLVED</i><b className="mth-mono">0</b></span>
        </div>
      </div>

      <div className="rail-box">
        <div className="rail">
          {STATIONS.map((s, i) => (
            <div
              key={s}
              className={`rl${f && i < f.station ? ' done' : ''}${f && i === f.station ? (f.halted ? ' halt' : ' now') : ''}`}
            >
              <span className="rl-dot"></span>
              <span className="rl-name">{s}</span>
            </div>
          ))}
        </div>
        <p className="rail-cap">
          {f ? (
            f.halted ? (
              <><b>{f.name}</b> is halted at {STATIONS[f.station] ?? 'the line'} — status{' '}
              <code>{f.status}</code>. Shown, not hidden.</>
            ) : (
              <><b>{f.name}</b> is being born.</>
            )
          ) : (
            <>No product is on the line at this moment.</>
          )}
        </p>
      </div>
    </div>
  );
}
