import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState, ComplaintStatusBadge } from '../../components/ui';
import { fmt } from '../../utils/format';

// ---------------------------------------------------------------------------
// Officer Public Complaints list — the EXACT complaints filed by the public,
// all linked to their certificates. Each row links to the single complaint
// record (same ID) the officer will act on.
// ---------------------------------------------------------------------------

export default function OfficerComplaints() {
  const { appComplaints, appInstruments } = useApp();
  const { t } = useLanguage();

  const sorted = [...appComplaints].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

  return (
    <div>
      <PageHeader title={t('publicComplaints')} subtitle={t('officerComplaintsSub')} />

      {sorted.length === 0 ? (
        <EmptyState message={t('noComplaintsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('complaintIdLabel'), t('certificateNo'), t('machineOrInstrumentId'), t('complaintOwnerCol'), t('complaintTypeCol'), t('complaintDateCol'), t('complaintTimeCol'), t('complaintLocationCol'), t('complaintStatusLabel'), '']}>
            {sorted.map(c => {
              const ins = appInstruments.find(i => i.id === c.instrumentId);
              return (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{c.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-800">{c.certificateId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.instrumentId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.ownerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.complaintType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.filedAt || fmt(c.submittedAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.filedTime || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins?.location || '—'}</td>
                  <td className="px-4 py-3"><ComplaintStatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/officer/complaints/${c.id}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('viewLink')}</Link>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}