'use server';

/**
 * Server actions that proxy requests to the TakaTrack backend.
 * Use API_URL on server (or NEXT_PUBLIC_API_URL as fallback).
 * Authenticated actions accept accessToken from the client.
 */

const getBaseUrl = () =>
  (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function backendFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {}
): Promise<T> {
  const { accessToken, ...fetchOptions } = options;
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(fetchOptions.headers as HeadersInit);

  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text);
      message = (j as { message?: string; error?: string }).message || (j as { message?: string; error?: string }).error || text;
    } catch {
      // use text
    }
    throw new Error(JSON.stringify({ status: res.status, message }));
  }

  if (res.status === 204 || res.headers.get('Content-Length') === '0') {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// --- Types (mirror api-client for server use) ---
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  tenantId: string;
  schemaName: string;
  role: string;
  mustChangePassword: boolean;
}

export interface BrandingResponse {
  logoUrl: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
  mpesaPaybill: string | null;
  tenantName: string | null;
}

export interface TenantResponse {
  id: number;
  name: string;
  slug: string;
  schemaName: string;
  status: string;
  logoUrl: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
  mpesaPaybill: string | null;
}

/** ERD: City – one City has many Areas */
export interface City {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  cityId: number | null;
  parentId: number | null;
  name: string;
  type: string;
}

export interface FleetTruck {
  id: number;
  plateNumber: string;
  capacity: number | null;
  active: boolean;
}

export interface Route {
  id: number;
  name: string;
  areaId: number;
  stops?: unknown[];
}

export interface Trip {
  id: number;
  routeId: number;
  truckId: number;
  driverProfileId: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  status: string;
}

export interface WorkforceAttendance {
  id: number;
  profileId: number;
  attendanceDate: string;
  present: boolean;
}

export interface Invoice {
  id: number;
  residentProfileId: number;
  amount: number;
  dueDate: string;
  status: string;
}

export interface Payment {
  id: number;
  invoiceId?: number;
  amount: number;
  reference?: string;
}

export interface WorkforcePayroll {
  id: number;
  profileId: number;
  periodStart: string;
  periodEnd: string;
  amount: number;
  paidAt: string | null;
}

// --- Auth (no token) ---
export async function loginAction(email: string, password: string): Promise<LoginResponse> {
  return backendFetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshAction(refreshToken: string): Promise<LoginResponse | null> {
  try {
    return await backendFetch<LoginResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }
}

export async function logoutAction(refreshToken: string): Promise<void> {
  try {
    await backendFetch<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // ignore
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  accessToken: string | null
): Promise<void> {
  await backendFetch<void>('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
    accessToken,
  });
}

// --- Branding ---
export async function getBrandingAction(accessToken: string | null): Promise<BrandingResponse> {
  return backendFetch<BrandingResponse>('/api/v1/config/branding', { accessToken });
}

export async function getBrandingBySlugAction(slug: string): Promise<BrandingResponse> {
  return backendFetch<BrandingResponse>(
    `/api/v1/config/branding/public?tenant=${encodeURIComponent(slug)}`
  );
}

// --- Users (platform admin) ---
export interface UserListDto {
  id: number;
  email: string;
  role: string;
  tenantId: number;
  tenantName: string;
  active: boolean;
  createdAt: string;
}

export async function getUsersAction(accessToken: string | null): Promise<UserListDto[]> {
  return backendFetch<UserListDto[]>('/api/v1/users', { accessToken });
}

export async function createUserAction(
  body: { email: string; role: string; tenantId: number },
  accessToken: string | null
): Promise<UserListDto> {
  return backendFetch<UserListDto>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

// --- Tenants ---
/** List all tenants (cities). Platform admin only. Each city = one tenant with its own schema and white-label. */
export async function getTenantsAction(accessToken: string | null): Promise<TenantResponse[]> {
  return backendFetch<TenantResponse[]>('/api/v1/tenants', { accessToken });
}

export async function getTenantAction(id: number, accessToken: string | null): Promise<TenantResponse | null> {
  try {
    return await backendFetch<TenantResponse>(`/api/v1/tenants/${id}`, { accessToken });
  } catch {
    return null;
  }
}

export async function createTenantAction(
  body: { name: string; slug: string; logoUrl?: string; primaryColor?: string; contactEmail?: string; mpesaPaybill?: string },
  accessToken: string | null
): Promise<TenantResponse> {
  return backendFetch<TenantResponse>('/api/v1/tenants', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

// --- Areas ---
export async function getCitiesAction(accessToken: string | null): Promise<City[]> {
  return backendFetch<City[]>('/api/v1/cities', { accessToken });
}

export async function getAreasRootsAction(accessToken: string | null): Promise<Area[]> {
  return backendFetch<Area[]>('/api/v1/areas', { accessToken });
}

export async function getAreaAction(id: number, accessToken: string | null): Promise<Area | null> {
  try {
    return await backendFetch<Area>(`/api/v1/areas/${id}`, { accessToken });
  } catch {
    return null;
  }
}

export async function getAreaChildrenAction(areaId: number, accessToken: string | null): Promise<Area[]> {
  return backendFetch<Area[]>(`/api/v1/areas/${areaId}/children`, { accessToken });
}

export async function createAreaAction(body: Partial<Area>, accessToken: string | null): Promise<Area> {
  return backendFetch<Area>('/api/v1/areas', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function updateAreaAction(id: number, body: Partial<Area>, accessToken: string | null): Promise<Area> {
  return backendFetch<Area>(`/api/v1/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function deleteAreaAction(id: number, accessToken: string | null): Promise<void> {
  return backendFetch<void>(`/api/v1/areas/${id}`, { method: 'DELETE', accessToken });
}

// --- Trucks ---
export async function getTrucksAction(accessToken: string | null): Promise<FleetTruck[]> {
  return backendFetch<FleetTruck[]>('/api/v1/trucks', { accessToken });
}

export async function getTruckAction(id: number, accessToken: string | null): Promise<FleetTruck | null> {
  try {
    return await backendFetch<FleetTruck>(`/api/v1/trucks/${id}`, { accessToken });
  } catch {
    return null;
  }
}

export async function createTruckAction(body: Partial<FleetTruck>, accessToken: string | null): Promise<FleetTruck> {
  return backendFetch<FleetTruck>('/api/v1/trucks', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function updateTruckAction(id: number, body: Partial<FleetTruck>, accessToken: string | null): Promise<FleetTruck> {
  return backendFetch<FleetTruck>(`/api/v1/trucks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    accessToken,
  });
}

// --- Routes ---
export async function getRoutesByAreaAction(areaId: number, accessToken: string | null): Promise<Route[]> {
  return backendFetch<Route[]>(`/api/v1/routes?areaId=${areaId}`, { accessToken });
}

export async function createRouteAction(body: Route, accessToken: string | null): Promise<Route> {
  return backendFetch<Route>('/api/v1/routes', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

// --- Trips ---
export async function startTripAction(
  routeId: number,
  truckId: number,
  driverProfileId: number,
  accessToken: string | null
): Promise<Trip> {
  return backendFetch<Trip>('/api/v1/trips/start', {
    method: 'POST',
    body: JSON.stringify({ routeId, truckId, driverProfileId }),
    accessToken,
  });
}

export async function finishTripAction(id: number, accessToken: string | null): Promise<Trip> {
  return backendFetch<Trip>(`/api/v1/trips/${id}/finish`, { method: 'POST', accessToken });
}

// --- Attendance ---
export async function getAttendanceAction(date: string, accessToken: string | null): Promise<WorkforceAttendance[]> {
  return backendFetch<WorkforceAttendance[]>(`/api/v1/attendance?date=${date}`, { accessToken });
}

export async function markAttendanceAction(
  profileId: number,
  attendanceDate: string,
  present: boolean,
  accessToken: string | null
): Promise<WorkforceAttendance> {
  return backendFetch<WorkforceAttendance>('/api/v1/attendance', {
    method: 'POST',
    body: JSON.stringify({ profileId, attendanceDate, present }),
    accessToken,
  });
}

// --- Finance ---
export async function getInvoicesAction(residentProfileId: number, accessToken: string | null): Promise<Invoice[]> {
  return backendFetch<Invoice[]>(`/api/v1/invoices?residentProfileId=${residentProfileId}`, { accessToken });
}

export async function createInvoiceAction(
  residentProfileId: number,
  amount: number,
  dueDate: string,
  accessToken: string | null
): Promise<Invoice> {
  return backendFetch<Invoice>('/api/v1/invoices', {
    method: 'POST',
    body: JSON.stringify({ residentProfileId, amount, dueDate }),
    accessToken,
  });
}

export async function recordPaymentAction(
  invoiceId: number,
  amount: number,
  reference: string | undefined,
  accessToken: string | null
): Promise<Payment> {
  return backendFetch<Payment>('/api/v1/payments', {
    method: 'POST',
    body: JSON.stringify({ invoiceId, amount, reference }),
    accessToken,
  });
}

export async function initiateMpesaAction(
  invoiceId: number,
  phoneNumber: string,
  accessToken: string | null
): Promise<{ checkoutRequestId?: string }> {
  return backendFetch<{ checkoutRequestId?: string }>('/api/v1/payments/mpesa/initiate', {
    method: 'POST',
    body: JSON.stringify({ invoiceId, phoneNumber }),
    accessToken,
  });
}

// --- Payroll ---
export async function createPayrollAction(
  profileId: number,
  periodStart: string,
  periodEnd: string,
  amount: number,
  accessToken: string | null
): Promise<WorkforcePayroll> {
  return backendFetch<WorkforcePayroll>('/api/v1/payroll', {
    method: 'POST',
    body: JSON.stringify({ profileId, periodStart, periodEnd, amount }),
    accessToken,
  });
}

export async function markPayrollPaidAction(id: number, accessToken: string | null): Promise<WorkforcePayroll> {
  return backendFetch<WorkforcePayroll>(`/api/v1/payroll/${id}/paid`, { method: 'POST', accessToken });
}

// --- Notifications ---
export async function registerFcmTokenAction(token: string, accessToken: string | null): Promise<void> {
  return backendFetch<void>('/api/v1/notifications/register', {
    method: 'POST',
    body: JSON.stringify({ token }),
    accessToken,
  });
}

// --- Residents (created by Collection Manager) ---
export interface CreatedResident {
  userId: number;
  profileId: number;
  email: string;
  fullName: string;
  temporaryPassword: string;
}

export async function createResidentAction(
  body: { email: string; fullName: string; phone?: string; areaId: number },
  accessToken: string | null
): Promise<CreatedResident> {
  return backendFetch<CreatedResident>('/api/v1/residents', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

// --- Reports (backend-generated; frontend only calls API) ---
export interface TenantSummaryDto {
  id: number;
  name: string;
  slug: string;
  status: string;
  userCount: number;
}

export interface ReportSummaryDto {
  tenantsCount?: number | null;
  areasCount?: number | null;
  usersCount?: number | null;
  tripsCount?: number | null;
  invoicesCount?: number | null;
  paymentsCount?: number | null;
  totalRevenue?: number | string | null;
  attendanceCount?: number | null;
  tenants?: TenantSummaryDto[] | null;
}

export interface FinanceReportDto {
  from: string;
  to: string;
  totalInvoices: number;
  totalPayments: number;
  totalRevenue: number | string;
  invoices: { id: number; residentProfileId: number; amount: number; dueDate: string; status: string }[];
  payments: { id: number; invoiceId: number; amount: number; reference?: string; paidAt: string }[];
}

export interface TripsReportDto {
  from: string;
  to: string;
  totalTrips: number;
  trips: { id: number; routeId: number; truckId: number; driverProfileId: number | null; startedAt: string | null; finishedAt: string | null; status: string }[];
}

export interface AttendanceReportDto {
  from: string;
  to: string;
  totalRecords: number;
  presentCount: number;
  records: { id: number; profileId: number; attendanceDate: string; present: boolean }[];
}

export async function getReportsSummaryAction(accessToken: string | null): Promise<ReportSummaryDto> {
  return backendFetch<ReportSummaryDto>('/api/v1/reports/summary', { accessToken });
}

export async function getReportsFinanceAction(
  from: string,
  to: string,
  accessToken: string | null
): Promise<FinanceReportDto> {
  return backendFetch<FinanceReportDto>(`/api/v1/reports/finance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { accessToken });
}

export async function getReportsTripsAction(
  from: string,
  to: string,
  accessToken: string | null
): Promise<TripsReportDto> {
  return backendFetch<TripsReportDto>(`/api/v1/reports/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { accessToken });
}

export async function getReportsAttendanceAction(
  from: string,
  to: string,
  accessToken: string | null
): Promise<AttendanceReportDto> {
  return backendFetch<AttendanceReportDto>(`/api/v1/reports/attendance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { accessToken });
}
