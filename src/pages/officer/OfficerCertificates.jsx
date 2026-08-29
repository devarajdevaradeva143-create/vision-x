import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';

export default function OfficerCertificates() {
  const { currentUser, appCertificates } = useApp();
  const { t } = useLanguage();
  const myCerts = appCertificates.filter(c => c.officerId === currentUser.id);

  return (
    <div>
      <PageHeader title={t('issuedCertificates')} subtitle={t('issuedCertificatesSubtitle')} />
      {myCerts.length === 0 ? (
        <EmptyState message={t('noIssuedCertsMsg')} />
      ) : (
        <Card>
          <Table headers={[t('certNo'), t('certInstrument'), t('ownerCert'), t('issueDateTable'), t('expiryDateTable'), t('validity'), '']}>
            {myCerts.map(cert => {
              const info = expiryInfo(cert.expiryDate);
              return (
                <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{cert.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.category} ({cert.instrumentId})</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.ownerName}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(cert.issueDate)}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(cert.expiryDate)}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ fontWeight: 700, color: info.color, fontSize: 13 }}>{info.label}</span></td>
                  <td style={{ padding: '12px 14px' }}><Link to={`/certificates/${cert.applicationId}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{t('viewLink')}</Link></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}
