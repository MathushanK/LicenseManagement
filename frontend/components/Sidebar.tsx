'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, KeyRound, ListChecks, UserCheck, ClipboardList } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/add-request', label: 'Add request', icon: PlusCircle },
  { href: '/licenses', label: 'Licenses', icon: KeyRound },
  { href: '/assigned-list', label: 'Assigned list', icon: ListChecks },
  { href: '/assign', label: 'Assign', icon: UserCheck },
  { href: '/requests', label: 'Requests', icon: ClipboardList },
];

export default function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <Link href="/dashboard" className="sidebar-brand">
        <span className="brand-mark">
          <Image src="/leco-logo.png" alt="LECO logo" width={26} height={38} priority />
        </span>
        {open && <span className="sidebar-brand-title">License Management</span>}
      </Link>

      <nav className="sidebar-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              title={item.label}
            >
              <Icon size={18} />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}