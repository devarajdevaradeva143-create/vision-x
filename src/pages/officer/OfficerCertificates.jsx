import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';

export default function OfficerCertificates() {
  const { currentUser, appCertificates } = useApp();
  const { t } = useLanguage();
  const myCerts = appCertificates.filter(c => c.officerId === currentUser.id);

  const validityClass = (info) => {
    if (info.status === 'expired') return 'text-red-800';
    if (info.status === 'expiring') return 'text-amber-800';
    return 'text-green-800';
  };

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
                <tr key={cert.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800">{cert.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cert.category} ({cert.instrumentId})</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cert.ownerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(cert.issueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(cert.expiryDate)}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-bold ${validityClass(info)}`}>{info.label}</span></td>
                  <td className="px-4 py-3"><Link to={`/certificates/${cert.applicationId}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('viewLink')}</Link></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}