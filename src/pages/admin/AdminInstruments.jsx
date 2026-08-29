import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';

export default function AdminInstruments() {
  const { appInstruments, appUsers } = useApp();
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t('instruments')} subtitle={t('allInstrumentsSub')} />
      {appInstruments.length === 0 ? <EmptyState message={t('noInstrumentsAdmin')} /> : (
        <Card>
          <Table headers={[t('tableId'), t('category'), t('manufacturer'), t('modelNumber'), t('serialNo'), t('capacityRange'), t('ownerCert')]}>
            {appInstruments.map(ins => {
              const owner = appUsers.find(u => u.id === ins.ownerId);
              return (
                <tr key={ins.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800">{ins.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{ins.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins.manufacturer}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins.modelNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins.serialNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ins.capacity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{owner?.name || '—'}</td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
}