import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`min-h-screen flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {children}
      </main>
    </div>
  );
}