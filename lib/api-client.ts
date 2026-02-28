/**
 * Central API client for TakaTrack backend.
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Sends JWT in Authorization header
 * - Refreshes token on 401 and retries once
 * - Token storage via callbacks (auth context owns tokens)
 */

const getApiUrl = () =>
  (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL) || '';

export type TokenGetter = () => { accessToken: string; refreshToken: string } | null;
export type TokenSetter = (access: string, refresh: string) => void;
export type RefreshFn = () => Promise<{ accessToken: string; refreshToken: string } | null>;

let tokenGetter: TokenGetter = () => null;
let tokenSetter: TokenSetter = () => {};
let refreshFn: RefreshFn = async () => null;

export function configureApiClient(config: {
  getTokens: TokenGetter;
  setTokens: TokenSetter;
  refresh: RefreshFn;
}) {
  tokenGetter = config.getTokens;
  tokenSetter = config.setTokens;
  refreshFn = config.refresh;
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; tenantSlug?: string } = {}
): Promise<T> {
  const { skipAuth, tenantSlug, ...fetchOptions } = options;
  const base = getApiUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(fetchOptions.headers as HeadersInit);

  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const tokens = tokenGetter();
    if (tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }

  if (tenantSlug && path.includes('branding/public')) {
    // already in path as query
  }

  let res = await fetch(url, { ...fetchOptions, headers });

  // Retry once with refreshed token on 401
  if (res.status === 401 && !skipAuth && refreshFn) {
    const newTokens = await refreshFn();
    if (newTokens?.accessToken) {
      headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
      res = await fetch(url, { ...fetchOptions, headers });
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text);
      message = j.message || j.error || text;
    } catch {
      // use text as message
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204 || res.headers.get('Content-Length') === '0') {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Parse error thrown from server actions (Error with JSON string message). */
export function parseActionError(e: unknown): { status: number; message: string } | null {
  if (e instanceof Error && e.message) {
    try {
      const parsed = JSON.parse(e.message) as { status?: number; message?: string };
      if (typeof parsed.status === 'number' && typeof parsed.message === 'string') {
        return { status: parsed.status, message: parsed.message };
      }
    } catch {
      // not our format
    }
    return { status: 500, message: e.message };
  }
  return null;
}

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  tenantId: string;
  schemaName: string;
  role: string;
}

export const authApi = {
  login: (body: LoginRequest) =>
    request<LoginResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body), skipAuth: true }),
  refresh: (refreshToken: string) =>
    request<LoginResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    }),
  logout: (refreshToken: string) =>
    request<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    }),
};

// --- Branding (white-label) ---
export interface BrandingResponse {
  logoUrl: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
  mpesaPaybill: string | null;
  tenantName: string | null;
}

export const brandingApi = {
  getCurrent: () => request<BrandingResponse>('/api/v1/config/branding'),
  getBySlug: (slug: string) =>
    request<BrandingResponse>(`/api/v1/config/branding/public?tenant=${encodeURIComponent(slug)}`, { skipAuth: true }),
};

// --- Tenants (platform admin) ---
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

export interface CreateTenantRequest {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  contactEmail?: string;
  mpesaPaybill?: string;
}

export const tenantsApi = {
  get: (id: number) => request<TenantResponse>(`/api/v1/tenants/${id}`),
  create: (body: CreateTenantRequest) =>
    request<TenantResponse>('/api/v1/tenants', { method: 'POST', body: JSON.stringify(body) }),
};

// --- Areas (hierarchical: city, zone, ward, estate) ---
export interface Area {
  id: number;
  parentId: number | null;
  name: string;
  type: string;
}

export const areasApi = {
  listRoots: () => request<Area[]>('/api/v1/areas'),
  get: (id: number) => request<Area>(`/api/v1/areas/${id}`),
  getChildren: (id: number) => request<Area[]>(`/api/v1/areas/${id}/children`),
  create: (body: Partial<Area>) => request<Area>('/api/v1/areas', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Area>) =>
    request<Area>(`/api/v1/areas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/api/v1/areas/${id}`, { method: 'DELETE' }),
};

// --- Fleet (trucks) ---
export interface FleetTruck {
  id: number;
  plateNumber: string;
  capacity: number | null;
  active: boolean;
}

export const trucksApi = {
  list: () => request<FleetTruck[]>('/api/v1/trucks'),
  get: (id: number) => request<FleetTruck>(`/api/v1/trucks/${id}`),
  create: (body: Partial<FleetTruck>) =>
    request<FleetTruck>('/api/v1/trucks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<FleetTruck>) =>
    request<FleetTruck>(`/api/v1/trucks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// --- Routes & Trips ---
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

export const routesApi = {
  listByArea: (areaId: number) => request<Route[]>(`/api/v1/routes?areaId=${areaId}`),
  create: (body: Route) => request<Route>('/api/v1/routes', { method: 'POST', body: JSON.stringify(body) }),
};

export const tripsApi = {
  start: (routeId: number, truckId: number, driverProfileId: number) =>
    request<Trip>('/api/v1/trips/start', {
      method: 'POST',
      body: JSON.stringify({ routeId, truckId, driverProfileId }),
    }),
  finish: (id: number) =>
    request<Trip>(`/api/v1/trips/${id}/finish`, { method: 'POST' }),
  recordLocation: (id: number, latitude: number, longitude: number) =>
    request<{ id: number }>(`/api/v1/trips/${id}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),
};

// --- Attendance ---
export interface WorkforceAttendance {
  id: number;
  profileId: number;
  attendanceDate: string;
  present: boolean;
}

export const attendanceApi = {
  list: (date: string) => request<WorkforceAttendance[]>(`/api/v1/attendance?date=${date}`),
  mark: (profileId: number, attendanceDate: string, present: boolean) =>
    request<WorkforceAttendance>('/api/v1/attendance', {
      method: 'POST',
      body: JSON.stringify({ profileId, attendanceDate, present }),
    }),
};

// --- Finance ---
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

export const financeApi = {
  listInvoices: (residentProfileId: number) =>
    request<Invoice[]>(`/api/v1/invoices?residentProfileId=${residentProfileId}`),
  createInvoice: (residentProfileId: number, amount: number, dueDate: string) =>
    request<Invoice>('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify({ residentProfileId, amount, dueDate }),
    }),
  recordPayment: (invoiceId: number, amount: number, reference?: string) =>
    request<Payment>('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, amount, reference }),
    }),
  initiateMpesa: (invoiceId: number, phoneNumber: string) =>
    request<{ checkoutRequestId?: string }>('/api/v1/payments/mpesa/initiate', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, phoneNumber }),
    }),
};

// --- Payroll ---
export interface WorkforcePayroll {
  id: number;
  profileId: number;
  periodStart: string;
  periodEnd: string;
  amount: number;
  paidAt: string | null;
}

export const payrollApi = {
  create: (profileId: number, periodStart: string, periodEnd: string, amount: number) =>
    request<WorkforcePayroll>('/api/v1/payroll', {
      method: 'POST',
      body: JSON.stringify({ profileId, periodStart, periodEnd, amount }),
    }),
  markPaid: (id: number) =>
    request<WorkforcePayroll>(`/api/v1/payroll/${id}/paid`, { method: 'POST' }),
};

// --- Notifications (FCM) ---
export const notificationsApi = {
  registerToken: (token: string) =>
    request<void>('/api/v1/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};
