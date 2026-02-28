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
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { createResidentAction, type CreatedResident } from '@/lib/actions';
import { ApiError, parseActionError } from '@/lib/auth-context';

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  estate?: string;
  cluster?: string;
  subscriptionStatus: 'active' | 'inactive' | 'suspended';
  monthlyFee?: number;
  lastPayment?: string;
  nextCollection?: string;
}

const MOCK_RESIDENTS: Resident[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+254712345678',
    estate: 'Kilimani',
    cluster: 'A',
    subscriptionStatus: 'active',
    monthlyFee: 500,
    lastPayment: '2024-02-20',
    nextCollection: '2024-02-24',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+254712345679',
    estate: 'Parklands',
    cluster: 'B',
    subscriptionStatus: 'active',
    monthlyFee: 600,
    lastPayment: '2024-02-15',
    nextCollection: '2024-02-25',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    phone: '+254712345680',
    estate: 'Lavington',
    cluster: 'C',
    subscriptionStatus: 'suspended',
    monthlyFee: 500,
    lastPayment: '2024-01-20',
    nextCollection: undefined,
  },
];

export default function CollectionResidentsPage() {
  const { getAccessToken } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [lastCreated, setLastCreated] = useState<CreatedResident | null>(null);

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = residents.filter((r) => r.subscriptionStatus === 'active').length;
  const suspendedCount = residents.filter((r) => r.subscriptionStatus === 'suspended').length;

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Residents Management</h1>
          <p className="text-muted-foreground">Manage resident subscriptions and details</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Resident
            </Button>
          </DialogTrigger>
          <AddResidentDialog
            creating={creating}
            error={createError}
            lastCreated={lastCreated}
            onCreate={async (payload) => {
              setCreateError('');
              setCreating(true);
              try {
                const created = await createResidentAction(
                  {
                    email: payload.email,
                    fullName: payload.fullName,
                    phone: payload.phone || undefined,
                    areaId: Number(payload.areaId),
                  },
                  getAccessToken()
                );
                setLastCreated(created);
                setResidents((prev) => [
                  {
                    id: String(created.userId),
                    name: created.fullName,
                    email: created.email,
                    phone: payload.phone,
                    subscriptionStatus: 'active',
                  },
                  ...prev,
                ]);
              } catch (e) {
                const parsed = parseActionError(e);
                if (parsed) {
                  setCreateError(parsed.message);
                } else if (e instanceof ApiError) {
                  setCreateError(e.message);
                } else {
                  setCreateError('Failed to create resident');
                }
              } finally {
                setCreating(false);
              }
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Residents"
          value={residents.length}
          icon={<Mail className="h-8 w-8" />}
        />
        <StatCard
          title="Active Subscribers"
          value={activeCount}
          icon={<Phone className="h-8 w-8" />}
        />
        <StatCard
          title="Suspended"
          value={suspendedCount}
          icon={<AlertCircle className="h-8 w-8" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Residents</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Residents List</CardTitle>
        </CardHeader>
        <CardContent>
          {lastCreated && (
            <div className="mb-4 text-sm bg-muted p-3 rounded-md">
              <p className="font-semibold">Resident created.</p>
              <p>
                Email: <span className="font-mono">{lastCreated.email}</span>
              </p>
              <p>
                Temporary password:{' '}
                <span className="font-mono">{lastCreated.temporaryPassword}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Share this temporary password with the resident; they will be forced to change it on
                first login.
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Estate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Next Collection</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>{resident.phone}</TableCell>
                    <TableCell>{resident.estate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          resident.subscriptionStatus === 'active'
                            ? 'default'
                            : resident.subscriptionStatus === 'inactive'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {resident.subscriptionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>KES {resident.monthlyFee}</TableCell>
                    <TableCell>{resident.lastPayment}</TableCell>
                    <TableCell>{resident.nextCollection || 'N/A'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
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

interface AddResidentPayload {
  email: string;
  fullName: string;
  phone: string;
  areaId: string;
}

function AddResidentDialog({
  creating,
  error,
  lastCreated,
  onCreate,
}: {
  creating: boolean;
  error: string;
  lastCreated: CreatedResident | null;
  onCreate: (payload: AddResidentPayload) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaId, setAreaId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaId) return;
    await onCreate({ email, fullName, phone, areaId });
    setEmail('');
    setFullName('');
    setPhone('');
    // keep areaId for faster multiple entries in same area
  };

  return (
    <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Resident</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={creating}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={creating}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={creating}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Area ID</label>
          <Input
            type="number"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            required
            disabled={creating}
          />
          <p className="text-xs text-muted-foreground">
            Use the numeric area ID for the resident&apos;s estate/ward.
          </p>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Resident'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
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
