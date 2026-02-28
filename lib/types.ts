// User and Authentication Types
export type UserRole = 
  | 'platform_admin' 
  | 'city_manager' 
  | 'estate_manager' 
  | 'collection_manager' 
  | 'driver' 
  | 'youth' 
  | 'resident';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  cityId?: string;
  zoneId?: string;
  wardId?: string;
  estateId?: string;
  areaId?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  /** From JWT / login (multi-tenancy) */
  tenantId?: string;
  schemaName?: string;
  /** From backend login response: resident must change password on first login */
  mustChangePassword?: boolean;
}

// Geographic Area Hierarchy
export interface City {
  id: string;
  name: string;
  code: string;
  population?: number;
  coordinates?: [number, number];
}

export interface Zone {
  id: string;
  cityId: string;
  name: string;
  code: string;
}

export interface Ward {
  id: string;
  zoneId: string;
  name: string;
  code: string;
}

export interface Estate {
  id: string;
  wardId: string;
  name: string;
  code: string;
  population?: number;
}

export interface Cluster {
  id: string;
  estateId: string;
  name: string;
  code: string;
  residenceCount?: number;
}

// Residents and Subscriptions
export interface Resident {
  id: string;
  estateId: string;
  clusterId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates?: [number, number];
  accountStatus: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface Subscription {
  id: string;
  residentId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  frequencyDays: number; // 7 for weekly, 14 for fortnightly, 30 for monthly
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  lastCollectionDate?: string;
  nextCollectionDate: string;
}

// Vehicles and Equipment
export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: 'truck' | 'van' | 'motorcycle' | 'cart';
  capacity: number; // in kg
  status: 'available' | 'in_use' | 'maintenance' | 'damaged';
  purchaseDate: string;
  maintenanceDate?: string;
  gpsDevice?: {
    deviceId: string;
    lastUpdate: string;
    coordinates?: [number, number];
    speed?: number;
  };
}

// Routes and Trips
export interface Route {
  id: string;
  collectionManagerId: string;
  cityId?: string;
  zoneId?: string;
  wardId?: string;
  estateId?: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'inactive' | 'archived';
  estimatedDistance: number; // km
  estimatedTime: number; // minutes
  stops: Stop[];
  assignedVehicles?: string[]; // vehicle IDs
  createdAt: string;
}

export interface Stop {
  id: string;
  routeId: string;
  residentId?: string;
  clusterAreaId?: string;
  sequence: number;
  coordinates: [number, number];
  estimatedArrival: string; // time in HH:MM format
  stopType: 'residential' | 'communal' | 'bulk';
}

export interface Trip {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  youthId?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startLocation: [number, number];
  endLocation?: [number, number];
  wasteCollected: number; // kg
  pickups: TripPickup[];
  notes?: string;
}

export interface TripPickup {
  id: string;
  tripId: string;
  residenceId: string;
  pickupTime: string;
  wasteWeight: number; // kg
  wasteType?: string; // organic, plastic, metal, mixed, etc.
  notes?: string;
  photosUrl?: string[];
  status: 'pending' | 'collected' | 'missed' | 'rescheduled';
}

// Attendance and Workforce
export interface Attendance {
  id: string;
  userId: string; // driver or youth
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  hoursWorked?: number;
  notes?: string;
}

// Financial Data
export interface Payment {
  id: string;
  residentId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: 'mpesa' | 'card' | 'bank_transfer' | 'cash' | 'cheque';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  dueDate: string;
  notes?: string;
}

export interface DriverPayment {
  id: string;
  driverId: string;
  payrollPeriodStart: string;
  payrollPeriodEnd: string;
  baseSalary: number;
  tripsCompleted: number;
  bonusPerTrip: number;
  totalBonus: number;
  deductions?: number;
  grossAmount: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
}

export interface YouthPayment {
  id: string;
  youthId: string;
  payrollPeriodStart: string;
  payrollPeriodEnd: string;
  daysWorked: number;
  dailyRate: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'paid';
  paymentDate?: string;
}

export interface FinancialReport {
  id: string;
  collectionManagerId: string;
  periodStart: string;
  periodEnd: string;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenueExpected: number;
  totalRevenueCollected: number;
  collectionRate: number; // percentage
  paymentBreakdown: {
    mpesa: number;
    card: number;
    bank_transfer: number;
    cash: number;
    cheque: number;
  };
  expenses: {
    driverPayroll: number;
    youthPayroll: number;
    vehicleMaintenance: number;
    fuel: number;
    other: number;
  };
  netProfit: number;
}

// Issue/Complaint Tracking
export interface Issue {
  id: string;
  residentId: string;
  type: 'missed_collection' | 'damaged_property' | 'billing' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attachments?: string[];
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalTrips: number;
  completedTrips: number;
  pendingPickups: number;
  collectionRate: number;
  totalWasteCollected: number;
  activeSubscriptions: number;
  revenue: number;
  expenses: number;
}
