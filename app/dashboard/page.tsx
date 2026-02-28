'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Truck } from 'lucide-react';
import { getReportsSummaryAction, type ReportSummaryDto } from '@/lib/actions';
import { parseActionError } from '@/lib/api-client';

export default function DashboardPage() {
  const { user, getAccessToken } = useAuth();
  const token = getAccessToken();
  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<ReportSummaryDto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    getReportsSummaryAction(token)
      .then((data) => {
        setSummary(data);
        setStats({
          completedTrips: data.tripsCount ?? 0,
          collectionRate: 0,
          activeSubscriptions: 0,
          revenue: data.totalRevenue ?? 0,
          pendingPickups: 0,
          totalWasteCollected: 0,
        });
      })
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load dashboard data'));
  }, [token]);

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'platform_admin':
        return <AdminDashboard stats={stats} summary={summary} error={error} />;
      case 'city_manager':
        return <CityManagerDashboard stats={stats} />;
      case 'estate_manager':
        return <EstateManagerDashboard stats={stats} />;
      case 'collection_manager':
        return <CollectionManagerDashboard stats={stats} />;
      case 'driver':
        return <DriverDashboard stats={stats} />;
      case 'youth':
        return <YouthDashboard stats={stats} />;
      case 'resident':
        return <ResidentDashboard stats={stats} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground capitalize">
            {user?.role.replace('_', ' ')} Dashboard
          </p>
        </div>
        {getRoleDashboard()}
      </div>
    </div>
  );
}

function AdminDashboard({ stats, summary, error }: { stats: any; summary: ReportSummaryDto | null; error: string }) {
  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tenants"
          value={summary?.tenantsCount ?? '—'}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          title="Root Cities (Areas)"
          value={summary?.areasCount ?? '—'}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          title="Total Users"
          value={summary?.usersCount ?? '—'}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          title="Trips Completed (mock)"
          value={stats?.completedTrips || 0}
          icon={<Truck className="h-8 w-8" />}
        />
      </div>
    </div>
  );
}

function CityManagerDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Collection Rate"
        value={`${stats?.collectionRate || 0}%`}
        icon={<TrendingUp className="h-8 w-8" />}
      />
      <StatCard
        title="Active Trucks"
        value="24"
        icon={<Truck className="h-8 w-8" />}
      />
      <StatCard
        title="Pending Pickups"
        value={stats?.pendingPickups || 0}
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Waste Collected"
        value={`${stats?.totalWasteCollected || 0}kg`}
        icon={<DollarSign className="h-8 w-8" />}
      />
    </div>
  );
}

function EstateManagerDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Wards"
        value="8"
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Performance Score"
        value="92%"
        icon={<TrendingUp className="h-8 w-8" />}
      />
      <StatCard
        title="Issues Resolved"
        value="156"
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Collection Teams"
        value="32"
        icon={<Truck className="h-8 w-8" />}
      />
    </div>
  );
}

function CollectionManagerDashboard({ stats }: { stats: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscribers"
          value={stats?.activeSubscriptions || 0}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          title="Revenue (This Month)"
          value={`KES ${(stats?.revenue / 1000).toFixed(0)}K`}
          icon={<DollarSign className="h-8 w-8" />}
        />
        <StatCard
          title="Completed Trips"
          value={stats?.completedTrips || 0}
          icon={<Truck className="h-8 w-8" />}
        />
        <StatCard
          title="Collection Rate"
          value={`${stats?.collectionRate || 0}%`}
          icon={<TrendingUp className="h-8 w-8" />}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 bg-accent/20 rounded-lg text-center hover:bg-accent/30 cursor-pointer">
            <p className="text-sm font-medium">New Resident</p>
          </div>
          <div className="p-3 bg-accent/20 rounded-lg text-center hover:bg-accent/30 cursor-pointer">
            <p className="text-sm font-medium">New Route</p>
          </div>
          <div className="p-3 bg-accent/20 rounded-lg text-center hover:bg-accent/30 cursor-pointer">
            <p className="text-sm font-medium">New Trip</p>
          </div>
          <div className="p-3 bg-accent/20 rounded-lg text-center hover:bg-accent/30 cursor-pointer">
            <p className="text-sm font-medium">Payroll</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DriverDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard
        title="Today's Pickups"
        value="12"
        icon={<Truck className="h-8 w-8" />}
      />
      <StatCard
        title="Trips Completed"
        value="3"
        icon={<TrendingUp className="h-8 w-8" />}
      />
      <Card>
        <CardHeader>
          <CardTitle>Start Your Route</CardTitle>
        </CardHeader>
        <CardContent>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
            Begin Route
          </button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Check in to start your day</p>
          <button className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
            Check In
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function YouthDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard
        title="Days Worked"
        value="18"
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Earnings This Month"
        value="KES 8,500"
        icon={<DollarSign className="h-8 w-8" />}
      />
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
            Check In
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function ResidentDashboard({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">Active</p>
          <p className="text-sm text-muted-foreground">Next collection: Tomorrow at 8:00 AM</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">KES 0</p>
          <p className="text-sm text-muted-foreground">All payments up to date</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
            Make Payment
          </button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <button className="w-full bg-accent text-accent-foreground py-2 rounded-lg hover:bg-accent/90">
            Report Issue
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className="text-primary opacity-50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
