import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';

export default function AdminCertificates() {
  const { appCertificates } = useApp();

  return (
    <div>
      <PageHeader title="Certificates" subtitle="All certificates issued in the system" />
      {appCertificates.length === 0 ? <EmptyState message="No certificates issued." /> : (
        <Card>
          <Table headers={['Certificate', 'Application', 'Instrument', 'Owner', 'Expiry', 'Validity', '']}>
            {appCertificates.map(cert => {
              const info = expiryInfo(cert.expiryDate);
              return (
                <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{cert.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.applicationId}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.instrumentId}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.ownerName}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(cert.expiryDate)}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ fontWeight: 700, color: info.color, fontSize: 13 }}>{info.label}</span></td>
                  <td style={{ padding: '12px 14px' }}><Link to={`/certificates/${cert.applicationId}`} style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>View</Link></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}
