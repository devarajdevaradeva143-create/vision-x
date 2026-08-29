import { useLanguage } from '../context/LanguageContext';

const statusClasses = {
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-amber-100 text-amber-800',
  INSPECTED: 'bg-blue-100 text-blue-800',
  CERTIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabelKeys = {
  PAYMENT_PENDING: 'statusPaymentPending',
  SUBMITTED: 'statusSubmitted',
  SCHEDULED: 'statusScheduled',
  INSPECTED: 'statusInspected',
  CERTIFIED: 'statusCertified',
  REJECTED: 'statusRejected',
};

export function StatusBadge({ status }) {
  const { t } = useLanguage();
  const classes = statusClasses[status] || 'bg-gray-100 text-gray-700';
  // Keep the underlying status code (it is the shared enum used everywhere) but
  // display it through the translation key for the selected language.
  const label = statusLabelKeys[status] ? t(statusLabelKeys[status]) : status;
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

// Complaint workflow statuses (independent of the application status enum used
// by StatusBadge above, so the two never interfere):
// PENDING -> ASSIGNED -> INSPECTION SCHEDULED -> INSPECTED -> ACTION TAKEN -> RESOLVED
const complaintStatusClasses = {
  PENDING: 'bg-red-100 text-red-800',
  ASSIGNED: 'bg-amber-100 text-amber-800',
  'INSPECTION SCHEDULED': 'bg-blue-100 text-blue-800',
  INSPECTED: 'bg-blue-100 text-blue-800',
  'ACTION TAKEN': 'bg-green-100 text-green-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

export function ComplaintStatusBadge({ status }) {
  const { t } = useLanguage();
  const classes = complaintStatusClasses[status] || 'bg-gray-100 text-gray-700';
  const label = t(`complaintStatus_${status.replace(/ /g, '_')}`) || status;
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

const steps = [
  { key: 'SUBMITTED', labelKey: 'statSubmitted' },
  { key: 'SCHEDULED', labelKey: 'statScheduled' },
  { key: 'INSPECTED', labelKey: 'statInspected' },
  { key: 'CERTIFIED', labelKey: 'statCertifiedAdmin' },
];

export function ProgressTracker({ status }) {
  const { t } = useLanguage();
  const currentIndex = steps.findIndex(s => s.key === status);
  const isRejected = status === 'REJECTED';

  // Before payment the application has not really started the workflow yet.
  if (status === 'PAYMENT_PENDING') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-800">
        ⏳ Payment Pending — complete the payment to submit this application for verification.
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="rounded-md border border-red-200 bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
        ⚠ This application was REJECTED during inspection. Please review the remarks and re-apply.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center">
      {steps.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {done ? (done && i === currentIndex ? String(i + 1) : '✓') : String(i + 1)}
              </div>
              <span className={`text-xs font-semibold ${done ? 'text-green-700' : 'text-gray-500'}`}>{t(step.labelKey)}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-0.5 w-8 ${i < currentIndex ? 'bg-green-700' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Alert({ type = 'info', children }) {
  const colors = {
    info: { box: 'bg-blue-100 border-blue-200 text-blue-800', icon: 'ℹ' },
    success: { box: 'bg-green-100 border-green-200 text-green-800', icon: '✓' },
    warning: { box: 'bg-amber-100 border-amber-200 text-amber-800', icon: '⚠' },
    error: { box: 'bg-red-100 border-red-200 text-red-800', icon: '✕' },
  };
  const c = colors[type] || colors.info;
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm ${c.box}`}>
      <span className="font-bold">{c.icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function Card({ children, style, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="m-0 text-xl font-bold text-gray-800 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <Card className="py-10 text-center text-gray-500">
      <div className="mb-2 text-4xl">🗂</div>
      <div className="text-sm">{message}</div>
    </Card>
  );
}

export function Field({ label, value, color, className = '' }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${color ? '' : 'text-gray-800'} ${className}`} style={color ? { color } : undefined}>{value || <span className="text-gray-300">—</span>}</div>
    </div>
  );
}

export function DetailRow({ children }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            {headers.map(h => (
              <th key={h} className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}