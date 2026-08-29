import { createContext, useContext, useState, useEffect } from 'react';
import { users, applications, certificates, instruments, complaints } from '../data/mockData';

const AppContext = createContext(null);

// Persist each collection to localStorage so the Owner and the Officer always
// read the SAME application data, even across refreshes / session switches.
function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch {}
    return initial;
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [appUsers, setAppUsers] = usePersistedState('lm_app_users', users);
  const [appApplications, setAppApplications] = usePersistedState('lm_app_applications', applications);
  const [appCertificates, setAppCertificates] = usePersistedState('lm_app_certificates', certificates);
  const [appInstruments, setAppInstruments] = usePersistedState('lm_app_instruments', instruments);
  const [appComplaints, setAppComplaints] = usePersistedState('lm_app_complaints', complaints);

  const login = (email, password) => {
    const user = appUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => setCurrentUser(null);

  const register = (data) => {
    const exists = appUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return { success: false, error: 'An account with this email already exists' };
    const newUser = {
      id: generateUserOwnerId(),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: data.address,
      role: 'owner',
    };
    setAppUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const generateUserOwnerId = () => `OWN${String(appUsers.filter(u => u.role === 'owner').length + 1).padStart(3, '0')}`;

  const addApplication = (app) => {
    setAppApplications(prev => [...prev, app]);
  };

  const updateApplication = (id, updates) => {
    setAppApplications(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addCertificate = (cert) => {
    const exists = appCertificates.find(c => c.applicationId === cert.applicationId);
    if (exists) {
      setAppCertificates(prev => prev.map(c => c.applicationId === cert.applicationId ? cert : c));
    } else {
      setAppCertificates(prev => [...prev, cert]);
    }
  };

  const addUser = (user) => setAppUsers(prev => [...prev, user]);
  const updateUser = (id, updates) => setAppUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const deleteUser = (id) => setAppUsers(prev => prev.filter(u => u.id !== id));

  const addInstrument = (instrument) => {
    setAppInstruments(prev => [...prev, instrument]);
  };

  const updateInstrument = (id, updates) => setAppInstruments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const deleteInstrument = (id) => setAppInstruments(prev => prev.filter(i => i.id !== id));

  const addComplaint = (complaint) => {
    setAppComplaints(prev => [...prev, complaint]);
  };

  const updateComplaint = (id, updates) => {
    setAppComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      // Keep the nested officer 'progress' object merged so one PENDING ->
      // RESOLVED update chain never loses previously saved officer notes.
      const mergedProgress = updates.progress
        ? { ...(c.progress || {}), ...updates.progress }
        : c.progress;
      const { progress, ...rest } = updates;
      return { ...c, ...rest, progress: mergedProgress };
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, register,
      appUsers, setAppUsers, addUser, updateUser, deleteUser,
      appApplications, addApplication, updateApplication,
      appCertificates, addCertificate,
      appInstruments, addInstrument, updateInstrument, deleteInstrument,
      appComplaints, addComplaint, updateComplaint,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
