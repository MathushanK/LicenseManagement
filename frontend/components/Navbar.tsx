'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, LogOut, ShieldCheck, Users, KeyRound, History, FileBarChart, AppWindow, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [now, setNow] = useState(new Date());

  // Live clock in the top bar — updates every 30s, no need for per-second churn
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <nav className="topbar">
      <button className="hamburger-button" onClick={onToggleSidebar} aria-label="Toggle navigation">
        <Menu size={20} />
      </button>

      <div className="topbar-spacer" />

      {user?.role === 'ADMIN' && (
        <div className="admin-menu">
          <button
            className={`nav-link ${pathname.startsWith('/admin') ? 'nav-link-active' : ''}`}
            onClick={() => setAdminOpen(!adminOpen)}
          >
            <ShieldCheck size={16} /> Administration <ChevronDown size={14} />
          </button>
          {adminOpen && (
            <div className="admin-popover">
              <Link href="/admin/users" onClick={() => setAdminOpen(false)}><Users size={16} /> Users</Link>
              <Link href="/licenses" onClick={() => setAdminOpen(false)}><KeyRound size={16} /> Licenses</Link>
              <Link href="/applications" onClick={() => setAdminOpen(false)}><AppWindow size={16} /> Applications</Link>
              <Link href="/admin/audit" onClick={() => setAdminOpen(false)}><History size={16} /> Audit log</Link>
              <Link href="/admin/reports" onClick={() => setAdminOpen(false)}><FileBarChart size={16} /> Reports</Link>
            </div>
          )}
        </div>
      )}

      <div className="account-area">
        <span className="topbar-time">{timeString}</span>
        <button
          onClick={toggleTheme}
          className="theme-button"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <div className="avatar">{user?.fullName?.slice(0, 1) || 'U'}</div>
        <div className="account-copy">
          <strong>{user?.fullName || 'User'}</strong>
          <span>{user?.role?.toLowerCase() || 'member'}</span>
        </div>
        <button onClick={() => logout()} className="logout-button" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}