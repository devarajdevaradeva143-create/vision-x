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
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{c.id}</td>
                  <td style={{ padding: '12px 14px', color: '#0ea5e9', fontWeight: 600 }}>{c.certificateId}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{c.instrumentId}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{c.ownerName}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{c.complaintType}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{c.filedAt || fmt(c.submittedAt)}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{c.filedTime || '—'}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins?.location || '—'}</td>
                  <td style={{ padding: '12px 14px' }}><ComplaintStatusBadge status={c.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link to={`/officer/complaints/${c.id}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{t('viewLink')}</Link>
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
