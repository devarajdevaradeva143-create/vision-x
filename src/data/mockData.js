import { addDays, subDays, format } from 'date-fns';

const today = new Date();

export const users = [
  { id: 'OWN001', name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'owner123', role: 'owner', phone: '9876543210', address: '123 Industrial Area, Mumbai, Maharashtra' },
  { id: 'OWN002', name: 'Priya Mehta', email: 'priya@example.com', password: 'owner123', role: 'owner', phone: '9876543211', address: '45 Market Road, Delhi' },
  { id: 'OWN003', name: 'Anil Sharma', email: 'anil@example.com', password: 'owner123', role: 'owner', phone: '9876543212', address: '78 Gandhi Nagar, Ahmedabad, Gujarat' },
  { id: 'OWN004', name: 'Sunita Devi', email: 'sunita@example.com', password: 'owner123', role: 'owner', phone: '9876543213', address: '23 Civil Lines, Jaipur, Rajasthan' },

  { id: 'OFF001', name: 'Inspector Vikram Singh', email: 'vikram@gov.in', password: 'officer123', role: 'officer', phone: '9123456780', department: 'Legal Metrology, Maharashtra' },
  { id: 'OFF002', name: 'Inspector Anita Desai', email: 'anita@gov.in', password: 'officer123', role: 'officer', phone: '9123456781', department: 'Legal Metrology, Delhi' },
  { id: 'OFF003', name: 'Inspector Ramesh Gupta', email: 'ramesh@gov.in', password: 'officer123', role: 'officer', phone: '9123456782', department: 'Legal Metrology, Gujarat' },

  { id: 'ADM001', name: 'System Administrator', email: 'admin@gov.in', password: 'admin123', role: 'admin', phone: '9000000000', department: 'Legal Metrology Department - HQ' },
];

export const instrumentCategories = [
  { type: 'Weighing', categories: ['Electronic Balance', 'Platform Scale', 'Crane Scale', 'Weigh Bridge', 'Analytical Balance', 'Spring Balance'] },
  { type: 'Measuring', categories: ['Fuel Dispenser', 'Taximeter', 'Flow Meter', 'Pressure Gauge', 'Volumetric Flask', 'Measuring Tape'] },
  { type: 'Testing', categories: ['Hardness Tester', 'Tensile Testing Machine', 'Impact Tester', 'Calorimeter'] },
];

export const instruments = [
  { id: 'INS001', ownerId: 'OWN001', type: 'Weighing', category: 'Electronic Balance', manufacturer: 'Mettler Toledo', modelNumber: 'ME204', serialNumber: 'MT-2024-8831', capacity: '220 g', location: 'Mumbai Central Lab' },
  { id: 'INS002', ownerId: 'OWN001', type: 'Weighing', category: 'Platform Scale', manufacturer: 'Essae', modelNumber: 'DS-852', serialNumber: 'ES-2023-4412', capacity: '500 kg', location: 'Mumbai Warehouse' },
  { id: 'INS003', ownerId: 'OWN002', type: 'Measuring', category: 'Fuel Dispenser', manufacturer: 'Tokheim', modelNumber: 'Quantum 400', serialNumber: 'TK-2024-1199', capacity: '50 L/min', location: 'Delhi Fuel Station' },
  { id: 'INS004', ownerId: 'OWN002', type: 'Measuring', category: 'Taximeter', manufacturer: 'Omnitec', modelNumber: 'TM-200', serialNumber: 'OT-2023-5567', capacity: 'N/A', location: 'Delhi Taxi Depot' },
  { id: 'INS005', ownerId: 'OWN003', type: 'Weighing', category: 'Weigh Bridge', manufacturer: 'Avery Weigh-Tronix', modelNumber: 'WI-130', serialNumber: 'AW-2022-9912', capacity: '40 tonne', location: 'Ahmedabad Highway Checkpost' },
  { id: 'INS006', ownerId: 'OWN003', type: 'Measuring', category: 'Flow Meter', manufacturer: 'Endress+Hauser', modelNumber: 'Promag 10W', serialNumber: 'EH-2024-2233', capacity: '0-200 m³/h', location: 'Ahmedabad Processing Plant' },
  { id: 'INS007', ownerId: 'OWN004', type: 'Weighing', category: 'Analytical Balance', manufacturer: 'Sartorius', modelNumber: 'Quintix 224', serialNumber: 'SQ-2024-7788', capacity: '220 g', location: 'Jaipur Quality Lab' },
  { id: 'INS008', ownerId: 'OWN001', type: 'Testing', category: 'Hardness Tester', manufacturer: 'Instron', modelNumber: 'Wilson RB2000', serialNumber: 'IN-2023-3344', capacity: 'Rockwell/Brinell', location: 'Mumbai Testing Center' },
];

const statusFlow = ['SUBMITTED', 'SCHEDULED', 'INSPECTED', 'CERTIFIED'];

export const applications = [
  {
    id: 'APP-2026-001',
    instrumentId: 'INS001',
    ownerId: 'OWN001',
    officerId: 'OFF001',
    submissionDate: '2026-06-15',
    scheduledDate: '2026-07-10',
    inspectionDate: '2026-07-10',
    status: 'CERTIFIED',
    readings: { accuracy: '±0.0001g', repeatability: '0.00005g', linearity: 'Within limits', eccentricity: '0.0002g' },
    remarks: 'Instrument meets all OIML Class I standards. Calibration verified successfully.',
  },
  {
    id: 'APP-2026-002',
    instrumentId: 'INS002',
    ownerId: 'OWN001',
    officerId: 'OFF001',
    submissionDate: '2026-07-01',
    scheduledDate: '2026-07-25',
    inspectionDate: null,
    status: 'SCHEDULED',
    readings: null,
    remarks: null,
  },
  {
    id: 'APP-2026-003',
    instrumentId: 'INS003',
    ownerId: 'OWN002',
    officerId: 'OFF002',
    submissionDate: '2026-05-20',
    scheduledDate: '2026-06-15',
    inspectionDate: '2026-06-15',
    status: 'CERTIFIED',
    readings: { accuracy: '±0.5%', flowRate: '48.2 L/min', temperature: '32°C', pressure: '2.1 bar' },
    remarks: 'Fuel dispenser meets standards. Sealed and certified.',
  },
  {
    id: 'APP-2026-004',
    instrumentId: 'INS004',
    ownerId: 'OWN002',
    officerId: 'OFF002',
    submissionDate: '2026-08-01',
    scheduledDate: null,
    inspectionDate: null,
    status: 'SUBMITTED',
    readings: null,
    remarks: null,
  },
  {
    id: 'APP-2026-005',
    instrumentId: 'INS005',
    ownerId: 'OWN003',
    officerId: 'OFF003',
    submissionDate: '2026-04-10',
    scheduledDate: '2026-05-05',
    inspectionDate: '2026-05-05',
    status: 'REJECTED',
    readings: { accuracy: '±2.5%', loadTest: 'FAILED at 35 tonne', zeroError: '12 kg drift', repeatability: 'Poor' },
    remarks: 'Instrument failed load test. Zero drift exceeds permissible limits. Repair and re-apply.',
  },
  {
    id: 'APP-2026-006',
    instrumentId: 'INS006',
    ownerId: 'OWN003',
    officerId: 'OFF003',
    submissionDate: '2026-08-10',
    scheduledDate: '2026-08-28',
    inspectionDate: null,
    status: 'SCHEDULED',
    readings: null,
    remarks: null,
  },
  {
    id: 'APP-2026-007',
    instrumentId: 'INS007',
    ownerId: 'OWN004',
    officerId: 'OFF001',
    submissionDate: '2026-08-20',
    scheduledDate: null,
    inspectionDate: null,
    status: 'SUBMITTED',
    readings: null,
    remarks: null,
  },
  {
    id: 'APP-2026-008',
    instrumentId: 'INS001',
    ownerId: 'OWN001',
    officerId: 'OFF001',
    submissionDate: '2025-07-20',
    scheduledDate: '2025-08-15',
    inspectionDate: '2025-08-15',
    status: 'CERTIFIED',
    readings: { accuracy: '±0.0001g', repeatability: '0.00006g', linearity: 'Within limits', eccentricity: '0.0003g' },
    remarks: 'Previous certification - instrument passed all tests.',
  },
];

export const certificates = [
  {
    id: 'CERT-2026-001',
    applicationId: 'APP-2026-001',
    instrumentId: 'INS001',
    ownerId: 'OWN001',
    ownerName: 'Rajesh Kumar',
    instrumentType: 'Weighing',
    category: 'Electronic Balance',
    serialNumber: 'MT-2024-8831',
    verificationDate: '2026-07-10',
    issueDate: '2026-07-12',
    expiryDate: '2027-07-12',
    result: 'CERTIFIED',
    officerId: 'OFF001',
    officerName: 'Inspector Vikram Singh',
  },
  {
    id: 'CERT-2026-002',
    applicationId: 'APP-2026-003',
    instrumentId: 'INS003',
    ownerId: 'OWN002',
    ownerName: 'Priya Mehta',
    instrumentType: 'Measuring',
    category: 'Fuel Dispenser',
    serialNumber: 'TK-2024-1199',
    verificationDate: '2026-06-15',
    issueDate: '2026-06-18',
    expiryDate: '2026-09-10',
    result: 'CERTIFIED',
    officerId: 'OFF002',
    officerName: 'Inspector Anita Desai',
  },
  {
    id: 'CERT-2025-003',
    applicationId: 'APP-2026-008',
    instrumentId: 'INS001',
    ownerId: 'OWN001',
    ownerName: 'Rajesh Kumar',
    instrumentType: 'Weighing',
    category: 'Electronic Balance',
    serialNumber: 'MT-2024-8831',
    verificationDate: '2025-08-15',
    issueDate: '2025-08-18',
    expiryDate: '2026-08-18',
    result: 'CERTIFIED',
    officerId: 'OFF001',
    officerName: 'Inspector Vikram Singh',
  },
];

export function getInstrumentsByOwner(ownerId) {
  return instruments.filter(i => i.ownerId === ownerId);
}

export function getApplicationsByOwner(ownerId) {
  return applications.filter(a => a.ownerId === ownerId);
}

export function getApplicationsByOfficer(officerId) {
  return applications.filter(a => a.officerId === officerId);
}

export function getCertificateByApplication(appId) {
  return certificates.find(c => c.applicationId === appId);
}

export function getCertificateByInstrument(insId) {
  return certificates.filter(c => c.instrumentId === insId);
}

export function getExpiryStatus(expiryDate) {
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'expired', label: 'Expired', color: 'red', days: diffDays };
  if (diffDays <= 30) return { status: 'expiring', label: 'Expiring Soon', color: 'orange', days: diffDays };
  return { status: 'valid', label: 'Valid', color: 'green', days: diffDays };
}

// Default officer that a new (SUBMITTED) application is assigned to.
export function getDefaultOfficer() {
  return (users.find(u => u.role === 'officer') || {}).id;
}

// Application IDs continue after the seeded mock data and any runtime-created
// applications (read from localStorage) so they never collide.
export function generateApplicationId() {
  const runtime = (() => {
    try { const raw = localStorage.getItem('lm_app_applications'); if (raw) return JSON.parse(raw).length; } catch {}
    return 0;
  })();
  const num = Math.max(applications.length, runtime) + 1;
  return `APP-2026-${String(num).padStart(3, '0')}`;
}

export function generateCertificateId() {
  const num = certificates.length + 1;
  return `CERT-2026-${String(num).padStart(3, '0')}`;
}

export function generateInstrumentId() {
  const num = instruments.length + 1;
  return `INS${String(num).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// Public Complaints — linked to the EXACT certificate the citizen viewed.
// A complaint always stores the reference keys (certificateId, applicationId,
// instrumentId) so the whole chain stays connected:
//   Instrument -> Certificate -> Complaint -> Inspection -> Action -> Resolution
// ---------------------------------------------------------------------------

export const complaintTypes = [
  'Incorrect weight / measurement',
  'Verification expired',
  'Certificate not displayed',
  'Instrument damaged',
  'Suspected tampering',
  'Instrument at an unregistered location',
  'Overcharging / short weighing',
  'Other',
];

export const complaintStatusFlow = ['PENDING', 'ASSIGNED', 'INSPECTION SCHEDULED', 'INSPECTED', 'ACTION TAKEN', 'RESOLVED'];

export const complaints = [];

// Complaint IDs continue after any runtime-created complaints (localStorage)
// so they never collide, e.g. CMP-2026-00125.
export function generateComplaintId() {
  const runtime = (() => {
    try { const raw = localStorage.getItem('lm_app_complaints'); if (raw) return JSON.parse(raw).length; } catch {}
    return 0;
  })();
  const num = Math.max(complaints.length, runtime) + 1;
  return `CMP-2026-${String(num).padStart(5, '0')}`;
}
