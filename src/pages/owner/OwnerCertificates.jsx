import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';

export default function OwnerCertificates() {
  const { currentUser, appCertificates, appInstruments } = useApp();

  const myCerts = appCertificates
    .filter(c => c.ownerId === currentUser.id)
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  return (
    <div>
      <PageHeader title="My Certificates" subtitle="View and download certificates for your verified instruments" />

      {myCerts.length === 0 ? (
        <EmptyState message="No certificates have been issued for your instruments yet." />
      ) : (
        <Card>
          <Table headers={['Certificate No.', 'Instrument', 'Serial No.', 'Issue Date', 'Expiry Date', 'Validity', '']}>
            {myCerts.map(cert => {
              const info = expiryInfo(cert.expiryDate);
              const ins = appInstruments.find(i => i.id === cert.instrumentId);
              return (
                <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{cert.id}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.category}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{cert.serialNumber}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(cert.issueDate)}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{fmt(cert.expiryDate)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 700, color: info.color, fontSize: 13 }}>{info.label}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link to={`/certificates/${cert.applicationId}`} style={viewBtn}>View & QR</Link>
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

const viewBtn = {
  color: '#0ea5e9', fontWeight: 600, fontSize: 13, textDecoration: 'none',
};
