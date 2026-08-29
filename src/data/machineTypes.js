// ---------------------------------------------------------------------------
// Machine Type configuration (machine types, verification fees and payment QR).
// ---------------------------------------------------------------------------
// Source of truth for the machine type fee / QR data used by the owner's
// application payment section. Stored in localStorage so data (fees / QR
// values) can be changed later without editing code.
//
// Fees and QR codes are NOT hard-coded inside the application form; the
// payment section reads the matching entry for an application's machine type.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lm_machine_types';

// Default machine types with verification fees and their own unique QR text.
// Each machine type gets its own QR value so that changing the machine type
// automatically changes the QR code shown to the owner.
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

export function getMachineTypes() {
  return loadMachineTypes();
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

// Format a QR value into a fixed-size string so the QR renders consistently.
export function qrDataFor(type) {
  return type ? type.qrValue : '';
}
