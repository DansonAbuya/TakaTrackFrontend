'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getReportsSummaryAction,
  getReportsFinanceAction,
  getReportsTripsAction,
  getReportsAttendanceAction,
  type ReportSummaryDto,
  type FinanceReportDto,
  type TripsReportDto,
  type AttendanceReportDto,
} from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/api-client';
import { FileText, Building2, MapPin, Users, DollarSign, Truck, ClipboardCheck, Download } from 'lucide-react';

function formatDateRange(from: string, to: string) {
  return `${from} – ${to}`;
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(n);
}

export default function AdminReportsPage() {
  const { user, getAccessToken } = useAuth();
  const [summary, setSummary] = useState<ReportSummaryDto | null>(null);
  const [financeReport, setFinanceReport] = useState<FinanceReportDto | null>(null);
  const [tripsReport, setTripsReport] = useState<TripsReportDto | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeReport, setActiveReport] = useState<'finance' | 'trips' | 'attendance' | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const token = getAccessToken();
  const apiBase =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL) || '';
  const isPlatformAdmin = user?.role === 'platform_admin';
  const isCollectionManager = user?.role === 'collection_manager';

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getReportsSummaryAction(token)
      .then(setSummary)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load report summary'))
      .finally(() => setLoading(false));
  }, [token]);

  const downloadSummary = async () => {
    const accessToken = token;
    if (!accessToken) {
      setError('Missing access token');
      return;
    }
    try {
      const base = apiBase.replace(/\/$/, '');
      const url = `${base}/api/v1/reports/summary/export?format=${encodeURIComponent(
        exportFormat
      )}&from=${encodeURIComponent(
        dateFrom
      )}&to=${encodeURIComponent(dateTo)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to download PDF');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = exportFormat === 'csv' ? 'summary-report.csv' : 'summary-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to download PDF');
    }
  };

  const loadFinanceReport = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setLoadingReport(true);
    setActiveReport('finance');
    try {
      const data = await getReportsFinanceAction(dateFrom, dateTo, token);
      setFinanceReport(data);
      setError('');
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Failed to load finance report');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadTripsReport = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setLoadingReport(true);
    setActiveReport('trips');
    try {
      const data = await getReportsTripsAction(dateFrom, dateTo, token);
      setTripsReport(data);
      setError('');
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Failed to load trips report');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadAttendanceReport = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setLoadingReport(true);
    setActiveReport('attendance');
    try {
      const data = await getReportsAttendanceAction(dateFrom, dateTo, token);
      setAttendanceReport(data);
      setError('');
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Failed to load attendance report');
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Platform and tenant reports. All data is generated on the backend.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded-md px-2 py-1 text-sm bg-background"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
            <Button variant="outline" className="gap-2" onClick={downloadSummary}>
              <Download className="h-4 w-4" />
              Download summary
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.tenantsCount != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.tenantsCount}</p>
              </CardContent>
            </Card>
          )}
          {summary.areasCount != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Root Areas (Cities)</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.areasCount}</p>
              </CardContent>
            </Card>
          )}
          {summary.usersCount != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.usersCount}</p>
              </CardContent>
            </Card>
          )}
          {summary.tripsCount != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trips (period)</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.tripsCount}</p>
              </CardContent>
            </Card>
          )}
          {summary.totalRevenue != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (period)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
              </CardContent>
            </Card>
          )}
          {summary.attendanceCount != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance (period)</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.attendanceCount}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tenants table (platform admin) */}
      {summary?.tenants && summary.tenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tenants
            </CardTitle>
            <p className="text-sm text-muted-foreground">All tenants and user counts</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.slug}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell className="text-right">{t.userCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Date range + tenant-level reports (collection manager) */}
      {isCollectionManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed reports (date range)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Finance, trips, and attendance for the current tenant
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={loadFinanceReport} disabled={loadingReport}>
                  Finance
                </Button>
                <Button onClick={loadTripsReport} disabled={loadingReport}>
                  Trips
                </Button>
                <Button onClick={loadAttendanceReport} disabled={loadingReport}>
                  Attendance
                </Button>
              </div>
            </div>

            {loadingReport && (
              <p className="text-sm text-muted-foreground">Loading report…</p>
            )}

            {activeReport === 'finance' && financeReport && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium">
                  Finance report: {formatDateRange(financeReport.from, financeReport.to)} —{' '}
                  {financeReport.totalInvoices} invoices, {financeReport.totalPayments} payments,{' '}
                  {formatCurrency(financeReport.totalRevenue)} revenue
                </p>
                {financeReport.invoices.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Resident</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financeReport.invoices.slice(0, 20).map((i) => (
                        <TableRow key={i.id}>
                          <TableCell>{i.id}</TableCell>
                          <TableCell>{i.residentProfileId}</TableCell>
                          <TableCell>{formatCurrency(i.amount)}</TableCell>
                          <TableCell>{i.dueDate}</TableCell>
                          <TableCell>{i.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {financeReport.invoices.length === 0 && financeReport.payments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No data in this range.</p>
                )}
              </div>
            )}

            {activeReport === 'trips' && tripsReport && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium">
                  Trips report: {tripsReport.totalTrips} trips in range
                </p>
                {tripsReport.trips.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Truck</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tripsReport.trips.slice(0, 20).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.id}</TableCell>
                          <TableCell>{t.routeId}</TableCell>
                          <TableCell>{t.truckId}</TableCell>
                          <TableCell>{t.startedAt ? new Date(t.startedAt).toLocaleString() : '—'}</TableCell>
                          <TableCell>{t.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No trips in this range.</p>
                )}
              </div>
            )}

            {activeReport === 'attendance' && attendanceReport && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium">
                  Attendance: {attendanceReport.totalRecords} records, {attendanceReport.presentCount} present
                </p>
                {attendanceReport.records.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Present</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceReport.records.slice(0, 20).map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.profileId}</TableCell>
                          <TableCell>{r.attendanceDate}</TableCell>
                          <TableCell>{r.present ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No attendance in this range.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isPlatformAdmin && (
        <p className="text-sm text-muted-foreground">
          Tenant-level reports (finance, trips, attendance) are available to Collection Managers for their tenant.
        </p>
      )}
    </div>
  );
}
