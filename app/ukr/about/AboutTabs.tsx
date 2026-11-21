'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import s from './about.module.css';

type Tab = 'patients' | 'partners';
const ANCHOR: Record<Tab, string> = { patients: 'patsiientam', partners: 'partneram' };

// Вкладки «Пацієнтам» / «Партнерам». Обидві панелі лежать у серверному HTML; неактивна ховається атрибутом hidden.
// Якір #partneram відкриває вкладку і прокручує до неї: читається при завантаженні і на hashchange.
export default function AboutTabs({ patients, partners }: { patients: ReactNode; partners: ReactNode }) {
  const [tab, setTab] = useState<Tab>('patients');

  const fromHash = useCallback((scroll: boolean) => {
    const h = window.location.hash.replace('#', '');
    const t = (Object.keys(ANCHOR) as Tab[]).find((k) => ANCHOR[k] === h);
    if (!t) return;
    setTab(t);
    if (scroll) requestAnimationFrame(() => document.getElementById(ANCHOR[t])?.scrollIntoView({ block: 'start' }));
  }, []);

  useEffect(() => {
    fromHash(true);
    const on = () => fromHash(true);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, [fromHash]);

  const btn = (t: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      id={`tab-${t}`}
      aria-controls={ANCHOR[t]}
      aria-selected={tab === t}
      tabIndex={tab === t ? 0 : -1}
      className={s.tab}
      onClick={() => setTab(t)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const next: Tab = t === 'patients' ? 'partners' : 'patients';
          setTab(next);
          document.getElementById(`tab-${next}`)?.focus();
        }
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className={s.tabsRow}>
        <h2 className={s.h2}>Кому він підходить</h2>
        <div role="tablist" aria-label="Кому підходить сервіс" className={s.tablist}>
          {btn('patients', 'Пацієнтам')}
          {btn('partners', 'Партнерам')}
        </div>
      </div>
      <div role="tabpanel" id="patsiientam" aria-labelledby="tab-patients" hidden={tab !== 'patients'} className={s.panel}>
        {patients}
      </div>
      <div role="tabpanel" id="partneram" aria-labelledby="tab-partners" hidden={tab !== 'partners'} className={s.panel}>
        {partners}
      </div>
    </>
  );
}
