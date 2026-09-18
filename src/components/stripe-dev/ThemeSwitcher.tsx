import { useEffect, useState } from 'react';

/** stripe.dev 테마 12종. 순서는 tokens.css 의 선언 순서와 같다. */
export const THEMES = [
  'default', 'paper', 'night-owl', 'omaha', 'web-rings',
  'crt-red', 'crt-amber', 'crt-green', 'crt-mono',
  '90s-vibes', 'valentines-day', 'st-patricks-day',
] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'sd-theme';

function applyTheme(theme: Theme) {
  document.querySelectorAll<HTMLElement>('.sd').forEach((root) => {
    if (theme === 'default') delete root.dataset.theme;
    else root.dataset.theme = theme;
  });
}

/**
 * 가장 가까운 `.sd` 루트의 data-theme 을 바꾸는 island.
 * 블로그 본체(:root)는 건드리지 않는다 — 랩 안에서만 테마가 바뀐다.
 */
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && THEMES.includes(saved)) {
        setTheme(saved);
        applyTheme(saved);
      }
    } catch {}
  }, []);

  const select = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  const cycle = (dir: 1 | -1) => {
    const i = THEMES.indexOf(theme);
    select(THEMES[(i + dir + THEMES.length) % THEMES.length]);
  };

  return (
    <div className="sd-switcher" role="group" aria-label="테마 선택">
      <button type="button" className="sd-navbtn text-smallcaps" onClick={() => cycle(-1)} aria-label="이전 테마">
        [←]
      </button>
      <select
        className="sd-navbtn text-smallcaps"
        value={theme}
        onChange={(e) => select(e.target.value as Theme)}
        aria-label="테마"
      >
        {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button type="button" className="sd-navbtn text-smallcaps" onClick={() => cycle(1)} aria-label="다음 테마">
        [→]
      </button>
    </div>
  );
}
