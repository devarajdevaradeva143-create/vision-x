import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ---------------------------------------------------------------------------
// LanguageSelector
// ---------------------------------------------------------------------------
// A small dropdown that lets the user switch between English / Tamil / Hindi /
// Malayalam / Bengali / Telugu / Kannada.
// It is rendered ONLY inside the main application (Layout), never on the Login
// page. When the user picks a language, the whole UI updates instantly because
// every page reads text through the shared `t()` translation helper.
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close the dropdown when the user clicks outside of it.
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const options = LANGUAGES.filter(l => l.code !== language);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-blue-700 bg-blue-800 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        <Globe size={16} className="text-amber-400" />
        <span>{current.label}</span>
        <span className="text-[10px] text-blue-200">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-40 overflow-hidden rounded-md border border-blue-800 bg-blue-900 p-1 shadow-sm">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-300">
            {t('language')}
          </div>
          <button
            onClick={() => { setLanguage(current.code); setOpen(false); }}
            className={optionClass(true)}
          >
            {current.label}
          </button>
          {options.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={optionClass(false)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const optionClass = (active) =>
  `block w-full rounded-md px-3 py-2 text-left text-xs font-semibold ${active ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`;