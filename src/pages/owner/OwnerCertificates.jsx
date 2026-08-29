import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';

export default function OwnerCertificates() {
  const { currentUser, appCertificates, appInstruments } = useApp();
  const { t } = useLanguage();

  const myCerts = appCertificates
    .filter(c => c.ownerId === currentUser.id)
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const validityClass = (info) => {
    if (info.status === 'expired') return 'text-red-800';
    if (info.status === 'expiring') return 'text-amber-800';
    return 'text-green-800';
  };

  return (
    <div>
      <PageHeader title={t('myCertificates')} subtitle={t('viewDownloadCerts')} />

      {myCerts.length === 0 ? (
        <EmptyState message={t('ownerCertsEmpty')} />
      ) : (
        <Card>
          <Table headers={[t('certNo'), t('certInstrument'), t('serialNo'), t('issueDateTable'), t('expiryDateTable'), t('validity'), '']}>{myCerts.map(cert => {
              const info = expiryInfo(cert.expiryDate);
              const ins = appInstruments.find(i => i.id === cert.instrumentId);
              return (
                <tr key={cert.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800">{cert.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cert.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cert.serialNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(cert.issueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fmt(cert.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${validityClass(info)}`}>{info.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/certificates/${cert.applicationId}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('viewCertificate')}</Link>
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