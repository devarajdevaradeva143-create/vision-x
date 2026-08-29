import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ---------------------------------------------------------------------------
// LanguageSelector
// ---------------------------------------------------------------------------
// A small dropdown that lets the user switch between English / Tamil / Hindi.
// It is rendered ONLY inside the main application (Layout), never on the Login
// page. When the user picks a language, the whole UI updates instantly because
// every page reads text through the shared `t()` translation helper.
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
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
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: '#1e293b', color: '#e2e8f0',
          border: '1px solid #334155', borderRadius: 8, cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
        }}
      >
        <Globe size={16} color="#38bdf8" />
        <span>{current.label}</span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)',
          background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
          minWidth: 160, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: 50,
          overflow: 'hidden', padding: 4,
        }}>
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('language')}
          </div>
          <button
            onClick={() => { setLanguage(current.code); setOpen(false); }}
            style={optionStyle(true)}
          >
            {current.label}
          </button>
          {options.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              style={optionStyle(false)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const optionStyle = (active) => ({
  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
  background: active ? 'rgba(56,189,248,0.12)' : 'transparent', color: '#e2e8f0',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  margin: 0,
});
