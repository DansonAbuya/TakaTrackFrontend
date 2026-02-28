'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const PERFORMANCE_DATA = [
  { week: 'Week 1', collectionRate: 92, issuesResolved: 8, teamEfficiency: 85 },
  { week: 'Week 2', collectionRate: 94, issuesResolved: 6, teamEfficiency: 88 },
  { week: 'Week 3', collectionRate: 96, issuesResolved: 4, teamEfficiency: 92 },
  { week: 'Week 4', collectionRate: 95, issuesResolved: 5, teamEfficiency: 90 },
];

const WARD_PERFORMANCE = [
  { ward: 'Kilimani', score: 96.2, subscriptions: 1250 },
  { ward: 'Parklands', score: 94.5, subscriptions: 980 },
  { ward: 'Lavington', score: 97.1, subscriptions: 750 },
];

const ISSUES_DATA = [
  { type: 'Missed Collection', count: 12, percentage: 35 },
  { type: 'Billing Issues', count: 8, percentage: 23 },
  { type: 'Property Damage', count: 5, percentage: 15 },
  { type: 'Other', count: 9, percentage: 27 },
];

export default function EstatePerformancePage() {
  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">Track wards performance and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Overall Collection Rate"
          value="95.2%"
          change="+2.1%"
          icon={<TrendingUp className="h-8 w-8" />}
        />
        <MetricCard
          title="Issues Resolved"
          value="23"
          change="This Month"
          icon={<CheckCircle className="h-8 w-8" />}
        />
        <MetricCard
          title="Pending Issues"
          value="5"
          change="Requires Action"
          icon={<AlertCircle className="h-8 w-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="collectionRate"
                  stroke="var(--primary)"
                  name="Collection Rate %"
                />
                <Line
                  type="monotone"
                  dataKey="teamEfficiency"
                  stroke="var(--accent)"
                  name="Team Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ward Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={WARD_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="ward" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="score" fill="var(--primary)" name="Performance Score" />
                <Bar yAxisId="right" dataKey="subscriptions" fill="var(--accent)" name="Subscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issues Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ISSUES_DATA.map((issue, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{issue.type}</span>
                  <span className="text-sm text-muted-foreground">{issue.count} issues ({issue.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${issue.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ward Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {WARD_PERFORMANCE.map((ward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{ward.ward}</p>
                    <p className="text-xs text-muted-foreground">{ward.subscriptions.toLocaleString()} subscriptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{ward.score.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
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
        <p className="text-xs text-green-500 mt-2">{change}</p>
      </CardContent>
    </Card>
  );
}
