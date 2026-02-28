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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Truck, Clock } from 'lucide-react';
import { getAreasRootsAction, getRoutesByAreaAction, createRouteAction, type Area, type Route } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';

export default function CollectionRoutesPage() {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const [areas, setAreas] = useState<Area[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAreasRootsAction(token).then(setAreas).catch(() => setAreas([]));
  }, [token]);

  useEffect(() => {
    if (!selectedAreaId) {
      setRoutes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getRoutesByAreaAction(Number(selectedAreaId), token)
      .then(setRoutes)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load routes'))
      .finally(() => setLoading(false));
  }, [selectedAreaId, token]);

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes Management</h1>
          <p className="text-muted-foreground">Create and manage collection routes by area</p>
        </div>
        {selectedAreaId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Route
              </Button>
            </DialogTrigger>
            <CreateRouteDialog
              areaId={Number(selectedAreaId)}
              onCreated={(r) => setRoutes((prev) => [...prev, r])}
              getAccessToken={getAccessToken}
            />
          </Dialog>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select area</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select area..." />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name} ({a.type || 'area'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Routes" value={routes.length} icon={<MapPin className="h-8 w-8" />} />
        <StatCard title="Area" value={selectedAreaId ? areas.find((a) => String(a.id) === selectedAreaId)?.name ?? '—' : '—'} icon={<Truck className="h-8 w-8" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by route name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!selectedAreaId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routes list</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !selectedAreaId ? (
            <p className="text-muted-foreground">Select an area above.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.areaId}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" title="View on map">
                          <MapPin className="h-4 w-4" />
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

function CreateRouteDialog({ areaId, onCreated, getAccessToken }: { areaId: number; onCreated: (r: Route) => void; getAccessToken: () => string | null }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const r = await createRouteAction({ name, areaId, stops: [] }, getAccessToken());
      onCreated(r);
      setName('');
    } catch (e) {
      setErr(parseActionError(e)?.message ?? 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New route</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div>
          <label className="text-sm font-medium">Route name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
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
