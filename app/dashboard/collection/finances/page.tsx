'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, AlertCircle, Download } from 'lucide-react';

interface Payment {
  id: string;
  residentName: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    residentName: 'Alice Johnson',
    amount: 500,
    method: 'Mpesa',
    date: '2024-02-24',
    status: 'completed',
    transactionId: 'TXN001',
  },
  {
    id: '2',
    residentName: 'Bob Smith',
    amount: 600,
    method: 'Mpesa',
    date: '2024-02-24',
    status: 'completed',
    transactionId: 'TXN002',
  },
  {
    id: '3',
    residentName: 'Carol White',
    amount: 500,
    method: 'Bank Transfer',
    date: '2024-02-23',
    status: 'pending',
    transactionId: 'TXN003',
  },
];

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 420000, target: 450000 },
  { month: 'Feb', revenue: 465000, target: 450000 },
  { month: 'Mar', revenue: 510000, target: 500000 },
  { month: 'Apr', revenue: 520000, target: 500000 },
  { month: 'May', revenue: 580000, target: 550000 },
  { month: 'Jun', revenue: 650000, target: 600000 },
];

const PAYMENT_METHODS = [
  { name: 'Mpesa', value: 45, color: '#8b5cf6' },
  { name: 'Bank Transfer', value: 30, color: '#06b6d4' },
  { name: 'Cash', value: 15, color: '#f59e0b' },
  { name: 'Card', value: 10, color: '#ef4444' },
];

const PAYROLL_DATA = [
  {
    id: '1',
    employee: 'James Mwangi',
    role: 'Driver',
    baseSalary: 25000,
    bonus: 5200,
    deductions: 2500,
    net: 27700,
    status: 'approved',
  },
  {
    id: '2',
    employee: 'Peter Omondi',
    role: 'Driver',
    baseSalary: 25000,
    bonus: 6800,
    deductions: 2500,
    net: 29300,
    status: 'approved',
  },
  {
    id: '3',
    employee: 'Samuel Kipchoge',
    role: 'Youth Worker',
    baseSalary: 12000,
    bonus: 1800,
    deductions: 0,
    net: 13800,
    status: 'pending',
  },
];

export default function CollectionFinancesPage() {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [payroll] = useState(PAYROLL_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPayments = payments.filter(
    (payment) =>
      payment.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const collectionRate = (payments.filter((p) => p.status === 'completed').length / payments.length * 100).toFixed(1);

  const totalPayroll = payroll.reduce((sum, p) => sum + p.net, 0);
  const totalBaseSalary = payroll.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalBonus = payroll.reduce((sum, p) => sum + p.bonus, 0);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Monitor revenue, payments, and payroll</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue (This Month)"
          value={`KES ${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          icon={<DollarSign className="h-8 w-8" />}
        />
        <MetricCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          change="On Track"
          icon={<TrendingUp className="h-8 w-8" />}
        />
        <MetricCard
          title="Pending Payments"
          value={pendingPayments}
          change="Follow up needed"
          icon={<AlertCircle className="h-8 w-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  name="Actual Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--accent)"
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={PAYMENT_METHODS}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {PAYMENT_METHODS.map((entry, index) => (
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
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by resident name or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.residentName}</TableCell>
                    <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'completed'
                            ? 'default'
                            : payment.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Base Salary</p>
              <p className="text-2xl font-bold">KES {totalBaseSalary.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Bonus</p>
              <p className="text-2xl font-bold">KES {totalBonus.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Payroll</p>
              <p className="text-2xl font-bold">KES {totalPayroll.toLocaleString()}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employee}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>KES {emp.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>KES {emp.bonus.toLocaleString()}</TableCell>
                    <TableCell>KES {emp.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">KES {emp.net.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.status === 'approved' ? 'default' : 'outline'}
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
