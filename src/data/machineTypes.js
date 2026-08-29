// ---------------------------------------------------------------------------
// Machine Type configuration (machine types, verification fees and payment QR).
// ---------------------------------------------------------------------------
// This module is the single source of truth for the machine type data used by
// both the Owner Registration form and the Admin QR management page.
//
// For this prototype the data is stored in localStorage so that an Admin can
// add / edit machine types, fees and QR codes without touching the code.
// Fees and QR codes are NOT hard-coded inside the registration form.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lm_machine_types';
const CATALOG_KEY = 'lm_online_catalog';

// Default machine types used on first load (prototype values).
// qrValue is the text encoded inside the QR code. Each machine type gets its
// own unique QR so that changing the machine type changes the QR automatically.
const DEFAULT_MACHINE_TYPES = [
  { id: 'MT001', name: 'Electronic Weighing Machine', fee: 300, qrValue: 'LMPAY:ELECTRONIC-WEIGHING:300' },
  { id: 'MT002', name: 'Retail Weighing Scale', fee: 250, qrValue: 'LMPAY:RETAIL-SCALE:250' },
  { id: 'MT003', name: 'Table Top Weighing Scale', fee: 250, qrValue: 'LMPAY:TABLE-TOP:250' },
  { id: 'MT004', name: 'Platform Weighing Machine', fee: 400, qrValue: 'LMPAY:PLATFORM-WEIGHING:400' },
  { id: 'MT005', name: 'Industrial Weighing Machine', fee: 500, qrValue: 'LMPAY:INDUSTRIAL-WEIGHING:500' },
  { id: 'MT006', name: 'Weighbridge', fee: 1000, qrValue: 'LMPAY:WEIGHBRIDGE:1000' },
  { id: 'MT007', name: 'Measuring Instrument', fee: 300, qrValue: 'LMPAY:MEASURING:300' },
  { id: 'MT008', name: 'Other', fee: 350, qrValue: 'LMPAY:OTHER:350' },
];

// Default searchable online weighing machine catalogue shown to the owner.
const DEFAULT_ONLINE_CATALOG = [
  { id: 'WM-1001', name: 'Electronic Weighing Machine', manufacturer: 'Example Manufacturer', model: 'EWM-100', capacity: '30 kg', serialNumber: 'SN-1001', type: 'Electronic Weighing Machine' },
  { id: 'WM-1002', name: 'Retail Weighing Scale', manufacturer: 'Example Manufacturer', model: 'RWS-200', capacity: '15 kg', serialNumber: 'SN-1002', type: 'Retail Weighing Scale' },
  { id: 'WM-1003', name: 'Platform Weighing Machine', manufacturer: 'Example Manufacturer', model: 'PWM-300', capacity: '500 kg', serialNumber: 'SN-1003', type: 'Platform Weighing Machine' },
  { id: 'WM-1004', name: 'Weighbridge', manufacturer: 'Example Manufacturer', model: 'WB-400', capacity: '40 tonne', serialNumber: 'SN-1004', type: 'Weighbridge' },
];

// Read machine types from localStorage, or seed with the default values.
function loadMachineTypes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupted storage */
  }
  return DEFAULT_MACHINE_TYPES;
}

// Read the online catalogue from localStorage, or seed with defaults.
function loadOnlineCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupted storage */
  }
  return DEFAULT_ONLINE_CATALOG;
}

export function getMachineTypes() {
  return loadMachineTypes();
}

export function getOnlineCatalog() {
  return loadOnlineCatalog();
}

// Find a machine type by name and return its fee and unique QR value.
export function getMachineTypeByName(name) {
  if (!name) return null;
  return loadMachineTypes().find((m) => m.name === name) || null;
}

// Save the full list back to localStorage.
export function saveMachineTypes(types) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

export function saveOnlineCatalog(catalog) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

// Format a QR value into a fixed-size string so the QR renders consistently.
export function qrDataFor(type) {
  return type ? type.qrValue : '';
}
