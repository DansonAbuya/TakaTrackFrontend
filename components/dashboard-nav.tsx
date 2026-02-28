'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useBranding } from '@/lib/branding-context';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardNavProps {
  user: User | null;
}

const roleNavigation: Record<string, { label: string; href: string }[]> = {
  platform_admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cities', href: '/dashboard/admin/cities' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Reports', href: '/dashboard/admin/reports' },
  ],
  city_manager: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Zones', href: '/dashboard/city/zones' },
    { label: 'Vehicles', href: '/dashboard/city/vehicles' },
    { label: 'KPIs', href: '/dashboard/city/kpis' },
  ],
  estate_manager: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Wards', href: '/dashboard/estate/wards' },
    { label: 'Performance', href: '/dashboard/estate/performance' },
  ],
  collection_manager: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Residents', href: '/dashboard/collection/residents' },
    { label: 'Routes', href: '/dashboard/collection/routes' },
    { label: 'Trips', href: '/dashboard/collection/trips' },
    { label: 'Drivers', href: '/dashboard/collection/drivers' },
    { label: 'Finances', href: '/dashboard/collection/finances' },
    { label: 'Reports', href: '/dashboard/admin/reports' },
  ],
  driver: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Today\'s Route', href: '/dashboard/driver/route' },
    { label: 'Attendance', href: '/dashboard/driver/attendance' },
  ],
  youth: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Attendance', href: '/dashboard/youth/attendance' },
    { label: 'Assignments', href: '/dashboard/youth/assignments' },
  ],
  resident: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Schedule', href: '/dashboard/resident/schedule' },
    { label: 'Payments', href: '/dashboard/resident/payments' },
    { label: 'Report Issue', href: '/dashboard/resident/issues' },
  ],
};

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { branding } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const appName = branding?.tenantName || 'TakaTrack';
  const logoUrl = branding?.logoUrl || '/logo.png';
  const navItems = user ? roleNavigation[user.role] || [] : [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar - fixed so only main content scrolls */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-6 space-y-6 z-30">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {logoUrl.startsWith('http') ? (
              <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
            ) : (
              <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
            )}
            <h1 className="text-lg font-bold text-sidebar-foreground">{appName}</h1>
          </div>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role.replace('_', ' ')}</p>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-sidebar-border space-y-3">
          <div className="text-xs text-sidebar-foreground/60">
            <p>{user?.name}</p>
            <p>{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          {logoUrl.startsWith('http') ? (
            <img src={logoUrl} alt={appName} className="h-6 w-6 object-contain" />
          ) : (
            <img src={logoUrl} alt={appName} className="h-6 w-6 object-contain" />
          )}
          <h1 className="text-sm font-bold text-sidebar-foreground">{appName}</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-sidebar-accent rounded-md"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden fixed top-14 left-0 right-0 bg-sidebar border-b border-sidebar-border p-4 space-y-2 z-40">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      )}
    </>
  );
}
