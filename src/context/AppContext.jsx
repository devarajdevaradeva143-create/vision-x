import { createContext, useContext, useState } from 'react';
import { users, applications, certificates, instruments } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [appUsers, setAppUsers] = useState(users);
  const [appApplications, setAppApplications] = useState(applications);
  const [appCertificates, setAppCertificates] = useState(certificates);
  const [appInstruments, setAppInstruments] = useState(instruments);

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

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, register,
      appUsers, setAppUsers, addUser, updateUser, deleteUser,
      appApplications, addApplication, updateApplication,
      appCertificates, addCertificate,
      appInstruments, addInstrument, updateInstrument, deleteInstrument,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
