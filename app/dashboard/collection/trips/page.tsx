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
import { Plus, Edit2, MapPin, Clock, Trash2, TrendingUp } from 'lucide-react';

interface Trip {
  id: string;
  routeName: string;
  driver: string;
  vehicle: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  pickups: number;
  completedPickups: number;
  wasteCollected: number;
}

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    routeName: 'Kilimani North Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    startTime: '2024-02-24 06:00',
    endTime: '2024-02-24 08:30',
    status: 'completed',
    pickups: 24,
    completedPickups: 24,
    wasteCollected: 1240,
  },
  {
    id: '2',
    routeName: 'Parklands East',
    driver: 'Peter Omondi',
    vehicle: 'KCA 124B',
    startTime: '2024-02-24 08:00',
    endTime: undefined,
    status: 'in_progress',
    pickups: 20,
    completedPickups: 15,
    wasteCollected: 680,
  },
  {
    id: '3',
    routeName: 'Lavington Central',
    driver: 'Samuel Kipchoge',
    vehicle: 'KCA 125C',
    startTime: '2024-02-24 07:30',
    endTime: undefined,
    status: 'in_progress',
    pickups: 32,
    completedPickups: 22,
    wasteCollected: 1050,
  },
  {
    id: '4',
    routeName: 'Kilimani South Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    startTime: '2024-02-23 06:00',
    endTime: '2024-02-23 08:45',
    status: 'completed',
    pickups: 28,
    completedPickups: 28,
    wasteCollected: 1380,
  },
];

export default function CollectionTripsPage() {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  let filteredTrips = trips.filter(
    (trip) =>
      trip.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterStatus !== 'all') {
    filteredTrips = filteredTrips.filter((trip) => trip.status === filterStatus);
  }

  const completedTrips = trips.filter((t) => t.status === 'completed').length;
  const inProgressTrips = trips.filter((t) => t.status === 'in_progress').length;
  const totalWasteCollected = trips.reduce((sum, t) => sum + t.wasteCollected, 0);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trips Tracking</h1>
          <p className="text-muted-foreground">Monitor real-time collection trips</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Completed Today"
          value={completedTrips}
          icon={<TrendingUp className="h-8 w-8" />}
        />
        <StatCard
          title="In Progress"
          value={inProgressTrips}
          icon={<Clock className="h-8 w-8" />}
        />
        <StatCard
          title="Total Waste Collected"
          value={`${totalWasteCollected} kg`}
          icon={<MapPin className="h-8 w-8" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by route name or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('scheduled')}
            >
              Scheduled
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trips List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Pickups Progress</TableHead>
                  <TableHead>Waste Collected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.routeName}</TableCell>
                    <TableCell>{trip.driver}</TableCell>
                    <TableCell>{trip.vehicle}</TableCell>
                    <TableCell>{trip.startTime}</TableCell>
                    <TableCell>{trip.endTime || 'Ongoing'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(trip.completedPickups / trip.pickups) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {trip.completedPickups}/{trip.pickups}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{trip.wasteCollected} kg</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trip.status === 'completed'
                            ? 'default'
                            : trip.status === 'in_progress'
                            ? 'secondary'
                            : trip.status === 'scheduled'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" title="View on map">
                        <MapPin className="h-4 w-4" />
                      </Button>
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
