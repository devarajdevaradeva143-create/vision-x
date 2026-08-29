import { createContext, useContext, useState, useEffect } from 'react';
import { users, applications, certificates, instruments } from '../data/mockData';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  users: 'vx_users',
  applications: 'vx_applications',
  certificates: 'vx_certificates',
  instruments: 'vx_instruments',
};

function readFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to read from localStorage:', key, e);
  }
  return fallback;
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to write to localStorage:', key, e);
  }
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [appUsers, setAppUsers] = useState(() => readFromStorage(STORAGE_KEYS.users, users));
  const [appApplications, setAppApplications] = useState(() => readFromStorage(STORAGE_KEYS.applications, applications));
  const [appCertificates, setAppCertificates] = useState(() => readFromStorage(STORAGE_KEYS.certificates, certificates));
  const [appInstruments, setAppInstruments] = useState(() => readFromStorage(STORAGE_KEYS.instruments, instruments));

  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEYS.users) setAppUsers(readFromStorage(e.key, users));
      else if (e.key === STORAGE_KEYS.applications) setAppApplications(readFromStorage(e.key, applications));
      else if (e.key === STORAGE_KEYS.certificates) setAppCertificates(readFromStorage(e.key, certificates));
      else if (e.key === STORAGE_KEYS.instruments) setAppInstruments(readFromStorage(e.key, instruments));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    setAppApplications(prev => {
      const next = [...prev, app];
      writeToStorage(STORAGE_KEYS.applications, next);
      return next;
    });
  };

  const updateApplication = (id, updates) => {
    setAppApplications(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      writeToStorage(STORAGE_KEYS.applications, next);
      return next;
    });
  };

  const addCertificate = (cert) => {
    const exists = appCertificates.find(c => c.applicationId === cert.applicationId);
    setAppCertificates(prev => {
      const next = exists
        ? prev.map(c => c.applicationId === cert.applicationId ? cert : c)
        : [...prev, cert];
      writeToStorage(STORAGE_KEYS.certificates, next);
      return next;
    });
  };

  const addUser = (user) => {
    setAppUsers(prev => {
      const next = [...prev, user];
      writeToStorage(STORAGE_KEYS.users, next);
      return next;
    });
  };
  const updateUser = (id, updates) => {
    setAppUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      writeToStorage(STORAGE_KEYS.users, next);
      return next;
    });
  };
  const deleteUser = (id) => {
    setAppUsers(prev => {
      const next = prev.filter(u => u.id !== id);
      writeToStorage(STORAGE_KEYS.users, next);
      return next;
    });
  };

  const addInstrument = (instrument) => {
    setAppInstruments(prev => {
      const next = [...prev, instrument];
      writeToStorage(STORAGE_KEYS.instruments, next);
      return next;
    });
  };

  const updateInstrument = (id, updates) => {
    setAppInstruments(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...updates } : i);
      writeToStorage(STORAGE_KEYS.instruments, next);
      return next;
    });
  };
  const deleteInstrument = (id) => {
    setAppInstruments(prev => {
      const next = prev.filter(i => i.id !== id);
      writeToStorage(STORAGE_KEYS.instruments, next);
      return next;
    });
  };

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