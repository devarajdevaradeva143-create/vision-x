import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import OwnerDashboard from './owner/OwnerDashboard';
import OfficerDashboard from './officer/OfficerDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function Dashboard() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" />;

  if (currentUser.role === 'owner') return <OwnerDashboard />;
  if (currentUser.role === 'officer') return <OfficerDashboard />;
  if (currentUser.role === 'admin') return <AdminDashboard />;
  return <Navigate to="/login" />;
}
