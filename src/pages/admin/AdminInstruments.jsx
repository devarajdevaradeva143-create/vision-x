import { useApp } from '../../context/AppContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';

export default function AdminInstruments() {
  const { appInstruments, appUsers } = useApp();

  return (
    <div>
      <PageHeader title="Instruments" subtitle="All registered weighing and measuring instruments" />
      {appInstruments.length === 0 ? <EmptyState message="No instruments registered." /> : (
        <Card>
          <Table headers={['ID', 'Category', 'Manufacturer', 'Model', 'Serial No.', 'Capacity', 'Owner']}>
            {appInstruments.map(ins => {
              const owner = appUsers.find(u => u.id === ins.ownerId);
              return (
                <tr key={ins.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0ea5e9' }}>{ins.id}</td>
                  <td style={{ padding: '12px 14px' }}>{ins.category}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.manufacturer}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.modelNumber}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.serialNumber}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{ins.capacity}</td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{owner?.name || '—'}</td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}
