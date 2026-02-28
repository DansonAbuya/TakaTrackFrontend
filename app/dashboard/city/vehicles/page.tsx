'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Fuel, MapPin } from 'lucide-react';
import { getTrucksAction, createTruckAction, updateTruckAction, type FleetTruck } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';

export default function CityVehiclesPage() {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const [vehicles, setVehicles] = useState<FleetTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getTrucksAction(token)
      .then(setVehicles)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load trucks'))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredVehicles = vehicles.filter((v) =>
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = vehicles.filter((v) => v.active).length;

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this truck from list?')) return;
    try {
      await updateTruckAction(id, { active: false }, token);
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, active: false } : v)));
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Update failed');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicles Management</h1>
          <p className="text-muted-foreground">Track and manage fleet trucks</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <AddTruckDialog onAdded={(t) => setVehicles((prev) => [...prev, t])} getAccessToken={getAccessToken} />
        </Dialog>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Trucks" value={vehicles.length} icon={<Fuel className="h-8 w-8" />} />
        <StatCard title="Active" value={availableCount} icon={<MapPin className="h-8 w-8" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by plate number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate</TableHead>
                    <TableHead>Capacity (kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.plateNumber}</TableCell>
                      <TableCell>{v.capacity ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={v.active ? 'default' : 'secondary'}>
                          {v.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <EditTruckDialog truck={v} onSaved={(t) => setVehicles((prev) => prev.map((x) => (x.id === t.id ? t : x)))} getAccessToken={getAccessToken} />
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddTruckDialog({ onAdded, getAccessToken }: { onAdded: (t: FleetTruck) => void; getAccessToken: () => string | null }) {
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const t = await createTruckAction(
        {
          plateNumber: plateNumber.trim(),
          capacity: capacity ? Number(capacity) : undefined,
          active: true,
        },
        getAccessToken()
      );
      onAdded(t);
      setPlateNumber('');
      setCapacity('');
    } catch (e) {
      setErr(parseActionError(e)?.message ?? 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add truck</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div>
          <label className="text-sm font-medium">Plate number</label>
          <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Capacity (kg)</label>
          <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditTruckDialog({ truck, onSaved, getAccessToken }: { truck: FleetTruck; onSaved: (t: FleetTruck) => void; getAccessToken: () => string | null }) {
  const [plateNumber, setPlateNumber] = useState(truck.plateNumber);
  const [capacity, setCapacity] = useState(String(truck.capacity ?? ''));
  const [active, setActive] = useState(truck.active);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const t = await updateTruckAction(
        truck.id,
        {
          plateNumber: plateNumber.trim(),
          capacity: capacity ? Number(capacity) : undefined,
          active,
        },
        getAccessToken()
      );
      onSaved(t);
    } catch (e) {
      setErr(parseActionError(e)?.message ?? 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit truck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div>
            <label className="text-sm font-medium">Plate number</label>
            <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Capacity (kg)</label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <label htmlFor="active" className="text-sm font-medium">Active</label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
