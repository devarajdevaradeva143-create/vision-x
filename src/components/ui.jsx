import { Link } from 'react-router-dom';

const statusColors = {
  SUBMITTED: '#6366f1',
  SCHEDULED: '#f59e0b',
  INSPECTED: '#0ea5e9',
  CERTIFIED: '#22c55e',
  REJECTED: '#ef4444',
};

export function StatusBadge({ status }) {
  const color = statusColors[status] || '#64748b';
  return (
    <span style={{ background: `${color}22`, color, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      {status}
    </span>
  );
}

const steps = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'INSPECTED', label: 'Inspected' },
  { key: 'CERTIFIED', label: 'Certified' },
];

export function ProgressTracker({ status }) {
  const currentIndex = steps.findIndex(s => s.key === status);
  const isRejected = status === 'REJECTED';

  if (isRejected) {
    return (
      <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontWeight: 600, fontSize: 13 }}>
        ⚠ This application was REJECTED during inspection. Please review the remarks and re-apply.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {steps.map((step, i) => {
        const done = i <= currentIndex;
        const color = done ? '#22c55e' : '#cbd5e1';
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: done ? '#22c55e' : '#e2e8f0',
                color: done ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>
                {done ? (done && i === currentIndex ? String(i + 1) : '✓') : String(i + 1)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: done ? '#15803d' : '#94a3b8' }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 30, height: 2, background: i < currentIndex ? '#22c55e' : '#e2e8f0', margin: '0 8px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Alert({ type = 'info', children }) {
  const colors = {
    info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: 'ℹ' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '✓' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', icon: '⚠' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', icon: '✕' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '10px 14px', borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontWeight: 700 }}>{c.icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function Card({ children, style }) {
  return <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, ...style }}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <Card style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🗂</div>
      <div style={{ fontSize: 14 }}>{message}</div>
    </Card>
  );
}

export function Field({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, color: color || '#0f172a', fontWeight: 500, marginTop: 2 }}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</div>
    </div>
  );
}

export function DetailRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>{children}</div>;
}

export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
