import { format, parseISO } from 'date-fns';

export function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function fmtFull(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = parseISO(dateStr);
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function expiryInfo(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { status: 'unknown', label: 'Unknown', color: '#64748b', days: null };
  if (days < 0) return { status: 'expired', label: 'Expired', color: '#ef4444', days };
  if (days <= 30) return { status: 'expiring', label: 'Expiring Soon', color: '#f59e0b', days };
  return { status: 'valid', label: 'Valid', color: '#22c55e', days };
}
