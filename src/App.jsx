import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OwnerInstruments from './pages/owner/OwnerInstruments';
import OwnerApplications from './pages/owner/OwnerApplications';
import ApplicationDetail from './pages/ApplicationDetail';
import OwnerCertificates from './pages/owner/OwnerCertificates';
import OfficerApplications from './pages/officer/OfficerApplications';
import OfficerApplicationDetail from './pages/officer/OfficerApplicationDetail';
import OfficerInspections from './pages/officer/OfficerInspections';
import OfficerCertificates from './pages/officer/OfficerCertificates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInstruments from './pages/admin/AdminInstruments';
import AdminApplications from './pages/admin/AdminApplications';
import AdminCertificates from './pages/admin/AdminCertificates';
import PublicVerify from './pages/PublicVerify';
import CertificateDetail from './pages/CertificateDetail';

function Protected({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function RoleOnly({ role, children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<PublicVerify />} />

        <Route path="/dashboard" element={<Protected><Layout><Dashboard /></Layout></Protected>} />

        <Route path="/instruments" element={<Protected><Layout><RoleOnly role="owner"><OwnerInstruments /></RoleOnly></Layout></Protected>} />
        <Route path="/applications" element={<Protected><Layout><RoleOnly role="owner"><OwnerApplications /></RoleOnly></Layout></Protected>} />
        <Route path="/applications/:id" element={<Protected><Layout><ApplicationDetail /></Layout></Protected>} />
        <Route path="/certificates" element={<Protected><Layout><RoleOnly role="owner"><OwnerCertificates /></RoleOnly></Layout></Protected>} />
        <Route path="/certificates/:id" element={<Protected><Layout><CertificateDetail /></Layout></Protected>} />

        <Route path="/officer/applications" element={<Protected><Layout><RoleOnly role="officer"><OfficerApplications /></RoleOnly></Layout></Protected>} />
        <Route path="/officer/applications/:id" element={<Protected><Layout><RoleOnly role="officer"><OfficerApplicationDetail /></RoleOnly></Layout></Protected>} />
        <Route path="/officer/inspections" element={<Protected><Layout><RoleOnly role="officer"><OfficerInspections /></RoleOnly></Layout></Protected>} />
        <Route path="/officer/certificates" element={<Protected><Layout><RoleOnly role="officer"><OfficerCertificates /></RoleOnly></Layout></Protected>} />

        <Route path="/admin/users" element={<Protected><Layout><RoleOnly role="admin"><AdminUsers /></RoleOnly></Layout></Protected>} />
        <Route path="/admin/instruments" element={<Protected><Layout><RoleOnly role="admin"><AdminInstruments /></RoleOnly></Layout></Protected>} />
        <Route path="/admin/applications" element={<Protected><Layout><RoleOnly role="admin"><AdminApplications /></RoleOnly></Layout></Protected>} />
        <Route path="/admin/certificates" element={<Protected><Layout><RoleOnly role="admin"><AdminCertificates /></RoleOnly></Layout></Protected>} />
        <Route path="/admin/status" element={<Protected><Layout><AdminDashboard /></Layout></Protected>} />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const { currentUser } = useApp();
  return <Navigate to={currentUser ? '/dashboard' : '/login'} replace />;
}
