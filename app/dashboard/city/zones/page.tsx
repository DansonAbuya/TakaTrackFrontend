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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit2, Trash2, MapPin, Users } from 'lucide-react';
import { getAreasRootsAction, getAreaChildrenAction, deleteAreaAction, type Area } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';

export default function CityZonesPage() {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const [rootAreas, setRootAreas] = useState<Area[]>([]);
  const [children, setChildren] = useState<Area[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAreasRootsAction(token)
      .then(setRootAreas)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load areas'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedParentId) {
      setChildren([]);
      return;
    }
    getAreaChildrenAction(Number(selectedParentId), token)
      .then(setChildren)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load zones'));
  }, [selectedParentId, token]);

  const filteredZones = children.filter(
    (z) =>
      z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this area?')) return;
    try {
      await deleteAreaAction(id, token);
      setChildren((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Delete failed');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zones Management</h1>
          <p className="text-muted-foreground">Manage zones (child areas) under a city</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select parent area (city)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select city..." />
            </SelectTrigger>
            <SelectContent>
              {rootAreas.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name} ({a.type || 'area'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Zones" value={children.length} icon={<MapPin className="h-8 w-8" />} />
        <StatCard title="Parent areas" value={rootAreas.length} icon={<Users className="h-8 w-8" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search zones</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!selectedParentId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zones list</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !selectedParentId ? (
            <p className="text-muted-foreground">Select a parent area above.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>{zone.type || '—'}</TableCell>
                      <TableCell>{zone.id}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(zone.id)}>
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
