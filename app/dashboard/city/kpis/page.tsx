'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Truck, DollarSign } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Jan', trips: 2400, revenue: 240000, subscriptions: 850 },
  { month: 'Feb', trips: 2210, revenue: 245000, subscriptions: 920 },
  { month: 'Mar', trips: 2290, revenue: 260000, subscriptions: 1050 },
  { month: 'Apr', trips: 2000, revenue: 250000, subscriptions: 1100 },
  { month: 'May', trips: 2181, revenue: 280000, subscriptions: 1200 },
  { month: 'Jun', trips: 2500, revenue: 300000, subscriptions: 1300 },
];

const WASTE_TYPE_DATA = [
  { name: 'Organic', value: 35, color: '#8b5cf6' },
  { name: 'Plastic', value: 25, color: '#06b6d4' },
  { name: 'Metal', value: 20, color: '#f59e0b' },
  { name: 'Mixed', value: 20, color: '#ef4444' },
];

const ZONE_PERFORMANCE = [
  { zone: 'Westlands', rate: 96.5, subscriptions: 2450 },
  { zone: 'Central', rate: 97.1, subscriptions: 3100 },
  { zone: 'Eastlands', rate: 94.2, subscriptions: 1850 },
  { zone: 'Southern', rate: 92.8, subscriptions: 1620 },
];

export default function CityKPIsPage() {
  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">City Performance KPIs</h1>
        <p className="text-muted-foreground">Monitor key performance indicators across zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Trips"
          value="2,500"
          change="+12.5%"
          icon={<Truck className="h-8 w-8" />}
        />
        <KPICard
          title="Active Subscriptions"
          value="9,020"
          change="+5.2%"
          icon={<Users className="h-8 w-8" />}
        />
        <KPICard
          title="Monthly Revenue"
          value="KES 1.2M"
          change="+8.3%"
          icon={<DollarSign className="h-8 w-8" />}
        />
        <KPICard
          title="Collection Rate"
          value="95.2%"
          change="+2.1%"
          icon={<TrendingUp className="h-8 w-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="var(--primary)"
                  name="Trips"
                />
                <Line
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="var(--accent)"
                  name="Subscriptions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={WASTE_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {WASTE_TYPE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ZONE_PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="zone" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="rate" fill="var(--primary)" name="Collection Rate %" />
              <Bar yAxisId="right" dataKey="subscriptions" fill="var(--accent)" name="Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zone Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ZONE_PERFORMANCE.map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="font-medium">{zone.zone}</p>
                  <p className="text-sm text-muted-foreground">{zone.subscriptions.toLocaleString()} subscriptions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{zone.rate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Collection Rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-primary opacity-50">{icon}</div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-green-500 mt-2">{change} vs last month</p>
      </CardContent>
    </Card>
  );
}
