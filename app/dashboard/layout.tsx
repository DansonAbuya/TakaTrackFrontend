'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useBranding } from '@/lib/branding-context';
import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { branding } = useBranding();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsReady(true);
      }
    }
  }, [loading, isAuthenticated, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const style = branding?.primaryColor
    ? ({ ['--primary' as string]: branding.primaryColor } as React.CSSProperties)
    : undefined;

  return (
    <div className="flex min-h-screen" style={style}>
      <DashboardNav user={user} />
      {/* Main content: offset by sidebar width, fixed height, only this area scrolls. White-label: logo/name/primary color from current tenant (city). */}
      <main className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64 pt-14 md:pt-0 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
