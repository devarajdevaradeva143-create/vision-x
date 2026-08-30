// ---------------------------------------------------------------------------
// Machine Type configuration (machine types, verification fees and payment QR).
// ---------------------------------------------------------------------------
// Source of truth for the machine type fee / QR data used by the owner's
// application payment section. Stored in localStorage so data (fees / QR
// values / QR images) can be changed later without editing code.
//
// Fees and QR codes are NOT hard-coded inside the application form; the
// payment section reads the matching entry for an application's machine type.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lm_machine_types';

// Default machine types with verification fees, unique QR text, and
// an optional admin-uploaded QR image (base64 data URL).
// Each machine type gets its own QR value and QR image so that
// changing the machine type automatically changes the QR shown.
const DEFAULT_MACHINE_TYPES = [
  { id: 'MT001', name: 'Electronic Balance', fee: 100, qrValue: 'LMPAY:ELECTRONIC-BALANCE:100', qrImage: null },
  { id: 'MT002', name: 'Platform Scale', fee: 400, qrValue: 'LMPAY:PLATFORM-SCALE:400', qrImage: null },
  { id: 'MT003', name: 'Weighing Scale', fee: 250, qrValue: 'LMPAY:WEIGHING-SCALE:250', qrImage: null },
  { id: 'MT004', name: 'Measuring Instrument', fee: 300, qrValue: 'LMPAY:MEASURING-INSTRUMENT:300', qrImage: null },
  { id: 'MT005', name: 'Other', fee: 350, qrValue: 'LMPAY:OTHER:350', qrImage: null },
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

// Find a machine type by name and return its full entry.
export function getMachineTypeByName(name) {
  if (!name) return null;
  return loadMachineTypes().find((m) => m.name === name) || null;
}

// Find a machine type by id.
export function getMachineTypeById(id) {
  if (!id) return null;
  return loadMachineTypes().find((m) => m.id === id) || null;
}

// Save the full list back to localStorage.
export function saveMachineTypes(types) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

// Format a QR value into a fixed-size string so the QR renders consistently.
export function qrDataFor(type) {
  return type ? type.qrValue : '';
}

// Update the qrImage (base64 data URL) for a specific machine type.
export function setMachineTypeQRImage(name, qrImage) {
  const types = loadMachineTypes();
  const idx = types.findIndex((m) => m.name === name);
  if (idx !== -1) {
    types[idx].qrImage = qrImage;
    saveMachineTypes(types);
  }
}

// Remove the qrImage for a specific machine type.
export function removeMachineTypeQRImage(name) {
  setMachineTypeQRImage(name, null);
}