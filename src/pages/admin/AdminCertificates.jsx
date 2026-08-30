import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Card, Table, EmptyState } from '../../components/ui';
import { fmt, expiryInfo } from '../../utils/format';
import { getMachineTypes, getMachineTypeByName, setMachineTypeQRImage, removeMachineTypeQRImage } from '../../data/machineTypes';

export default function AdminCertificates() {
  const { appCertificates } = useApp();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('certs'); // certs | qr
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const machineTypes = getMachineTypes();

  const handleQRUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!selectedMachineType) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMachineTypeQRImage(selectedMachineType, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQR = () => {
    if (!selectedMachineType) return;
    removeMachineTypeQRImage(selectedMachineType);
  };

  const selectedTypeInfo = selectedMachineType ? getMachineTypeByName(selectedMachineType) : null;

  return (
    <div>
      <PageHeader title={t('certificates')} subtitle={t('allCertsSub')} />

      {/* Tab navigation */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('certs')}
          className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === 'certs' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('certificate')}s
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === 'qr' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('machineTypeQR')}
        </button>
      </div>

      {activeTab === 'certs' ? (
        appCertificates.length === 0 ? <EmptyState message={t('noCertsAdmin')} /> : (
          <Card>
            <Table headers={[t('certificate'), t('application'), t('certInstrument'), t('ownerCert'), t('expiryDateTable'), t('validity'), '']}>
              {appCertificates.map(cert => {
                const info = expiryInfo(cert.expiryDate);
                return (
                  <tr key={cert.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-bold text-blue-800">{cert.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cert.applicationId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cert.instrumentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cert.ownerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{fmt(cert.expiryDate)}</td>
                    <td className="px-4 py-3"><span className={`text-sm font-bold ${expiryClass(info)}`}>{info.label}</span></td>
                    <td className="px-4 py-3"><Link to={`/certificates/${cert.applicationId}`} className="text-sm font-medium text-blue-800 hover:text-blue-900">{t('viewLink')}</Link></td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        )
      ) : (
        /* ------------------- QR MANAGEMENT ------------------- */
        <Card>
          <h3 className="m-0 mb-1 text-base font-bold text-gray-800">{t('machineTypeQR')}</h3>
          <p className="mb-4 text-sm text-gray-600">{t('machineTypeQRSubtitle')}</p>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('selectMachineType')}</label>
            <select
              value={selectedMachineType}
              onChange={e => { setSelectedMachineType(e.target.value); }}
              className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-700 focus:outline-none"
            >
              <option value="">{t('selectMachineType')}</option>
              {machineTypes.map(m => (
                <option key={m.id} value={m.name}>{m.name} — ₹{m.fee}</option>
              ))}
            </select>
          </div>

          {selectedTypeInfo && (
            <div className="rounded-md border border-blue-200 bg-blue-100 px-4 py-3 text-sm text-blue-800 mb-4">
              {t('machineType')}: <b>{selectedMachineType}</b> — {t('verificationFee')}: ₹{selectedTypeInfo.fee}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Upload area */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('qrUploadHint')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                disabled={!selectedMachineType}
                className="w-full max-w-sm cursor-pointer text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-800 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-900"
              />
              <div className="mt-2 text-xs text-gray-500">
                {selectedTypeInfo?.qrImage ? t('qrUploaded') : (t('noQRUploaded') + ' — ' + t('qrUploadHint').toLowerCase())}
              </div>
            </div>

            {/* Preview area */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('previewQR')}</label>
              <div className="rounded-md border border-gray-300 bg-white p-4">
                {selectedTypeInfo?.qrImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={selectedTypeInfo.qrImage} alt={`${selectedMachineType} QR`} className="h-40 w-40 object-contain" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (ev) => {
                            const file = ev.target.files && ev.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                               reader.onload = (e) => {
                                 setMachineTypeQRImage(selectedMachineType, e.target.result);
                               };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="cursor-pointer rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
                      >
                        {t('replaceQR')}
                      </button>
                      <button
                        onClick={handleRemoveQR}
                        className="cursor-pointer rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                      >
                        {t('removeQR')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 text-sm">
                    {t('noQRUploaded')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function expiryClass(info) {
  if (info.status === 'expired') return 'text-red-800';
  if (info.status === 'expiring') return 'text-amber-800';
  return 'text-green-800';
}