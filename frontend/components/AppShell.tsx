'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} />
        <div className={`app-shell-body ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
          <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
          <main className="app-main">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}