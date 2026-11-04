'use client';

// «Мій план обстеження» – клієнтська частина (docs/ux/specs/2026-11-my-plan.md v0.4).
// Порядок (§1): план → «Додано вами» → «Я в групі ризику →» → підсумок (вибір клініки, сума, дії) →
// «Додати дослідження» → ризик-флоу. Дані – з бази (lib/plan/data.ts), стан людини – лише в хеші (lib/plan/state.ts).
// Кольори – лише токени app/globals.css. Жодних підказок про ризик у Базовому плані, тривожних кольорів, знижок.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buttonClass } from '@/components/frame/Button';
import ExamCard from './ExamCard';
import PlanBooking, { type PlanBookingRequest } from './PlanBooking';
import { planEvents } from '@/lib/ga4';
import { MY_PLAN_CONFIG } from '@/lib/plan/config';
import type { MyPlanData, PlanClinic } from '@/lib/plan/data';
import { decodePlanState, EMPTY_STATE, encodePlanState, PLAN_HASH, type AddSource, type PlanUserState } from '@/lib/plan/state';
import { fmtDate, fmtUah, groupText, PLAN_T } from '@/lib/plan/texts';
import { AGE_GROUPS } from '@/lib/plan/age-groups';

const EV = { variant: MY_PLAN_CONFIG.leadVariant, entry_point: MY_PLAN_CONFIG.entryPoint };

function priced(c: PlanClinic | null, slug: string) {
  const p = c?.prices[slug];
  return p && typeof p === 'object' ? p : null;
}

export default function MyPlanClient({ data }: { data: MyPlanData }) {
  const [state, setState] = useState<PlanUserState>(EMPTY_STATE);
  const [riskOpen, setRiskOpen] = useState(false);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [booking, setBooking] = useState<PlanBookingRequest | null>(null);
  const [status, setStatus] = useState('');
  const riskRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const { exams, base, extras, risk, clinics } = data;
  const known = useMemo(() => new Set(Object.keys(exams)), [exams]);

  // Відкриття посилання з #plan= відновлює план (і зміна хешу на відкритій сторінці).
  useEffect(() => {
    const restore = () => {
      const s = decodePlanState(window.location.hash, data.gender, data.seg);
      if (!s) return;
      setState({
        clinic: clinics.some((c) => c.slug === s.clinic) ? s.clinic : null,
        dropped: s.dropped.filter((k) => base.some((r) => r.slug === k && !r.locked)),
        added: Object.fromEntries(Object.entries(s.added).filter(([k]) => known.has(k))),
        factors: s.factors.filter((f) => risk.some((r) => r.code === f)),
      });
      if (s.factors.length > 0) setRiskOpen(true);
    };
    restore();
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, [data.gender, data.seg, clinics, base, risk, known]);

  const multi = clinics.length >= 2;
  const active: PlanClinic | null = clinics.length === 1 ? clinics[0] : (clinics.find((c) => c.slug === state.clinic) ?? null);

  // Сума: Базовий план без прибраних і без «У консультації» + додані; послуги без повторів; дата – найстаріша.
  const sum = useMemo(() => {
    const slugs = [
      ...base.filter((r) => !state.dropped.includes(r.slug) && !exams[r.slug]?.includedIn).map((r) => r.slug),
      ...Object.keys(state.added).filter((s) => !exams[s]?.includedIn),
    ];
    if (!active) return null;
    const ids = new Set<string>();
    const missing: string[] = [];
    for (const s of slugs) {
      const p = priced(active, s);
      if (p) p.services.forEach((id) => ids.add(id));
      else missing.push(exams[s]?.name ?? s);
    }
    const svc = [...ids].map((id) => active.services[id]).filter(Boolean);
    const total = svc.reduce((a, s) => a + s.price, 0);
    const date = svc.map((s) => s.date).sort()[0] ?? null;
    return { total, date, ids: [...ids], missing, items: slugs.length - missing.length };
  }, [active, base, exams, state.added, state.dropped]);

  const cardPrice = (slug: string): { text: string; strong: boolean } | null => {
    if (exams[slug]?.includedIn || clinics.length === 0) return null;
    if (!active) {
      if (multi && !MY_PLAN_CONFIG.showPriceBeforeClinicPick) return { text: PLAN_T.priceAfterPick, strong: false };
      return null;
    }
    const p = priced(active, slug);
    return p ? { text: fmtUah(p.total), strong: true } : { text: PLAN_T.notIn(active.shortName), strong: false };
  };

  const drop = (slug: string) => {
    setState((s) => ({ ...s, dropped: [...s.dropped, slug] }));
    planEvents.itemDrop({ ...EV, slug });
  };
  const back = (slug: string) => {
    setState((s) => ({ ...s, dropped: s.dropped.filter((k) => k !== slug) }));
    planEvents.itemBack({ ...EV, slug });
  };
  const toggleAdd = (slug: string, source: AddSource) => {
    setState((s) => {
      const added = { ...s.added };
      if (added[slug]) {
        planEvents.examRemove({ ...EV, slug, source: added[slug] });
        delete added[slug];
      } else {
        added[slug] = source;
        planEvents.examAdd({ ...EV, slug, source });
      }
      return { ...s, added };
    });
  };
  const pickClinic = (slug: string) => {
    setState((s) => ({ ...s, clinic: slug }));
    planEvents.clinicPick({ ...EV, clinic: slug, position: clinics.findIndex((c) => c.slug === slug) + 1 });
  };
  const toggleFactor = (code: string) =>
    setState((s) => ({ ...s, factors: s.factors.includes(code) ? s.factors.filter((f) => f !== code) : [...s.factors, code] }));
  const flip = (key: string, slug: string, open: boolean) => {
    setFlipped(open ? key : null);
    if (open) planEvents.cardFlip({ ...EV, slug });
  };

  const openRisk = () => {
    const next = !riskOpen;
    setRiskOpen(next);
    if (next) {
      planEvents.riskFlowOpen(EV);
      requestAnimationFrame(() => riskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };
  const closeRisk = () => {
    setRiskOpen(false);
    requestAnimationFrame(() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const save = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${PLAN_HASH}=${encodePlanState(data.gender, data.seg, state)}`;
    window.history.replaceState(null, '', url);
    setStatus('');
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: PLAN_T.title, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus(PLAN_T.copied);
    } catch {
      setStatus('');
    }
  }, [data.gender, data.seg, state]);

  const book = () => {
    if (!active || !sum) return;
    planEvents.bookStart({ ...EV, items: sum.items, clinic: active.slug, price: sum.total });
    setBooking({ clinicId: active.id, clinicSlug: active.slug, clinicName: active.shortName, branches: active.branches, serviceIds: sum.ids, price: sum.total, items: sum.items });
  };

  const addedSlugs = Object.keys(state.added).filter((s) => exams[s]);
  const riskSlugs = [...new Set(risk.filter((f) => state.factors.includes(f.code)).flatMap((f) => f.slugs))].filter((s) => exams[s]);
  const textBtn =
    'shrink-0 inline-flex items-center min-h-11 px-1 text-[14px] font-semibold text-link underline decoration-1 underline-offset-[3px] hover:decoration-2 rounded-[var(--radius-sm)]';

  return (
    <>
      <div ref={planRef} className="max-w-[720px] scroll-mt-20">
        {/* 3. Базовий план + 4. «Додано вами» + 5. «Я в групі ризику →» – картка плану */}
        <div className="mt-[var(--space-block)] bg-white border border-[var(--border)] rounded-[var(--radius-lg)] px-[var(--space-card)]">
          <ul aria-label={PLAN_T.title}>
            {base.map((r) => {
              const e = exams[r.slug];
              const out = state.dropped.includes(r.slug);
              return (
                <li key={r.slug} className="flex items-start gap-3 py-3.5 border-b border-section-border">
                  <Mark on={!out} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[16px] font-semibold leading-snug ${out ? 'text-text-secondary line-through' : 'text-ink'}`}>{e.name}</p>
                    {r.condition && <p className="mt-0.5 text-[13px] text-text-secondary">{r.condition}</p>}
                    {out && <span className="inline-flex mt-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] bg-bg-subtle text-[13px] text-ink">{PLAN_T.dropped}</span>}
                  </div>
                  {r.locked ? (
                    <span className="shrink-0 pt-0.5 text-[14px] text-text-secondary">{PLAN_T.always}</span>
                  ) : e.includedIn ? (
                    <span className="shrink-0 pt-0.5 text-[14px] text-text-secondary">{PLAN_T.inConsultation}</span>
                  ) : out ? (
                    <button type="button" className={textBtn} onClick={() => back(r.slug)}>
                      {PLAN_T.restore}
                      <span className="sr-only">: {e.name}</span>
                    </button>
                  ) : (
                    <button type="button" className={textBtn} onClick={() => drop(r.slug)}>
                      {PLAN_T.drop}
                      <span className="sr-only">: {e.name}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {addedSlugs.length > 0 && (
            <div className="pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{PLAN_T.addedTitle}</p>
              <ul>
                {addedSlugs.map((s) => {
                  const p = priced(active, s);
                  return (
                    <li key={s} className="flex items-start gap-3 py-3.5 border-b border-section-border">
                      <Mark on />
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-semibold leading-snug text-ink">{exams[s].name}</p>
                        <p className="mt-0.5 text-[13px] text-text-secondary">{state.added[s] === 'risk' ? PLAN_T.addedRisk : PLAN_T.addedExtra}</p>
                      </div>
                      {active && <span className="shrink-0 pt-0.5 text-[14px] text-ink">{p ? fmtUah(p.total) : PLAN_T.notInClinicShort}</span>}
                      <button type="button" className={textBtn} onClick={() => toggleAdd(s, state.added[s])}>
                        {PLAN_T.removeAdded}
                        <span className="sr-only">: {exams[s].name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="py-3">
            <button type="button" aria-expanded={riskOpen} aria-controls="plan-risk" onClick={openRisk} className={textBtn}>
              {PLAN_T.riskLink}
            </button>
          </p>
        </div>

        {/* 6. Підсумок: вибір клініки, сума, дії */}
        <div className="mt-6">
          {clinics.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-ink">{PLAN_T.noPricesCity(data.city.inCity)}</p>
          ) : (
            multi && (
              <fieldset>
                <legend className="text-[15px] font-semibold text-ink mb-2">{PLAN_T.clinicLegend}</legend>
                <div className="flex flex-col gap-2">
                  {clinics.map((c) => (
                    <label
                      key={c.slug}
                      className={`flex items-center gap-3 min-h-14 px-4 py-2 rounded-[var(--radius-lg)] border cursor-pointer ${
                        state.clinic === c.slug ? 'border-link bg-brand-primary-soft' : 'border-[var(--border)] bg-white'
                      }`}
                    >
                      <input type="radio" name="plan-clinic" checked={state.clinic === c.slug} onChange={() => pickClinic(c.slug)} className="w-5 h-5 shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[16px] font-semibold text-ink">{c.shortName}</span>
                        {c.priceDate && <span className="block text-[13px] text-text-secondary">{PLAN_T.clinicPriceFrom(fmtDate(c.priceDate))}</span>}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[13px] text-text-secondary">{PLAN_T.clinicOrderNote}</p>
              </fieldset>
            )
          )}

          {active && sum && (
            <div className="mt-5">
              <div aria-live="polite">
                <p className="text-[15px] text-text-secondary">{PLAN_T.totalIn(active.shortName)}</p>
                <p className="mt-1 text-[26px] font-bold leading-tight text-text-primary" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {fmtUah(sum.total)}
                </p>
              </div>
              {sum.date && <p className="mt-1 text-[13px] text-text-secondary">{PLAN_T.priceNote(fmtDate(sum.date))}</p>}
              {MY_PLAN_CONFIG.excludeMissingFromSum && sum.missing.length > 0 && (
                <p className="mt-1 text-[13px] text-text-secondary">{PLAN_T.notInSum(sum.missing.join(', '))}</p>
              )}
              <button type="button" onClick={book} disabled={sum.items === 0} className={`${buttonClass({ variant: 'booking', size: 'lg', fullWidth: true })} mt-4 disabled:opacity-50`}>
                {PLAN_T.book}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={save}
            className={`${buttonClass({ variant: 'secondary', size: 'lg', fullWidth: true })} ${active ? 'mt-2' : 'mt-5'}`}
          >
            {PLAN_T.save}
          </button>
          <p role="status" className={`text-[14px] font-semibold text-ink ${status ? 'mt-2' : ''}`}>
            {status}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{PLAN_T.disclaimer}</p>
        </div>
      </div>

      {/* 7. «Додати дослідження» */}
      <div className="mt-12 max-w-[1120px]">
        {extras.length === 0 ? (
          <p className="max-w-[720px] text-[15px] text-text-secondary">{PLAN_T.extraNone(data.city.loc)}</p>
        ) : (
          <>
            <h3 className="text-[22px] font-bold text-ink">{PLAN_T.extraTitle}</h3>
            <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-text-secondary">{PLAN_T.extraLead}</p>
            <div className="mt-5 grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {extras.map((s, i) => (
                <div key={s} hidden={!showAll && i >= MY_PLAN_CONFIG.extraVisible}>
                  <ExamCard
                    exam={exams[s]}
                    idPrefix="extra"
                    price={cardPrice(s)}
                    added={Boolean(state.added[s])}
                    onToggle={() => toggleAdd(s, 'extra')}
                    flipped={flipped === `extra:${s}`}
                    onFlip={(o) => flip(`extra:${s}`, s, o)}
                  />
                </div>
              ))}
            </div>
            {!showAll && extras.length > MY_PLAN_CONFIG.extraVisible && (
              <button type="button" onClick={() => setShowAll(true)} className={`${buttonClass({ variant: 'secondary', size: 'md' })} mt-4`}>
                {PLAN_T.showMore(extras.length - MY_PLAN_CONFIG.extraVisible)}
              </button>
            )}
          </>
        )}
      </div>

      {/* 8. Ризик-флоу */}
      <div id="plan-risk" ref={riskRef} hidden={!riskOpen} className="mt-12 max-w-[1120px] scroll-mt-20">
        <h3 className="text-[22px] font-bold text-ink">{PLAN_T.riskTitle}</h3>
        {risk.length === 0 ? (
          <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-text-secondary">
            {PLAN_T.riskNone(groupText(data.gender, AGE_GROUPS[data.seg].label))}
          </p>
        ) : (
          <>
            <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-text-secondary">{PLAN_T.riskLead}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {risk.map((f) => {
                const on = state.factors.includes(f.code);
                return (
                  <button
                    key={f.code}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFactor(f.code)}
                    className={`inline-flex items-center min-h-11 px-4 rounded-[var(--radius-pill)] border-[1.5px] text-[14px] ${
                      on ? 'border-link bg-brand-primary-soft text-link font-semibold' : 'border-[var(--border)] bg-white text-ink'
                    }`}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
            {riskSlugs.length > 0 && (
              <div className="mt-5 grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                {riskSlugs.map((s) => (
                  <ExamCard
                    key={s}
                    exam={exams[s]}
                    idPrefix="risk"
                    price={cardPrice(s)}
                    added={Boolean(state.added[s])}
                    onToggle={() => toggleAdd(s, 'risk')}
                    flipped={flipped === `risk:${s}`}
                    onFlip={(o) => flip(`risk:${s}`, s, o)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <p className="mt-5">
          <button type="button" onClick={closeRisk} className={textBtn}>
            {PLAN_T.riskBack}
          </button>
        </p>
      </div>

      {booking && (
        <PlanBooking
          city={data.city.slug}
          request={booking}
          onClose={() => setBooking(null)}
        />
      )}
    </>
  );
}

/** Позначка рядка: у плані – заливка --brand-primary з галочкою; прибрано – порожній квадрат. */
function Mark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 w-[22px] h-[22px] shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center ${
        on ? 'bg-brand-primary' : 'bg-white border-2 border-border-strong'
      }`}
    >
      {on && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary-text">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
    </span>
  );
}
