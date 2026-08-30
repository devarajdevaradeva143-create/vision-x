import { useState } from 'react';
import Sidebar from './Sidebar';
import LanguageSelector from './LanguageSelector';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex min-h-screen flex-1 flex-col bg-gray-100 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <LanguageSelector />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}