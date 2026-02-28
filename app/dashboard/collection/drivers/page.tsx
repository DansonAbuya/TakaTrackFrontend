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
import { Plus, Edit2, Trash2, Users, Truck, AlertCircle, TrendingUp } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  idNumber: string;
  phone: string;
  vehicle: string;
  status: 'available' | 'on_route' | 'off_duty';
  tripsCompleted: number;
  rating: number;
  joinDate: string;
}

const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'James Mwangi',
    idNumber: '12345678',
    phone: '+254712345678',
    vehicle: 'KCA 123A',
    status: 'on_route',
    tripsCompleted: 245,
    rating: 4.8,
    joinDate: '2022-05-10',
  },
  {
    id: '2',
    name: 'Peter Omondi',
    idNumber: '12345679',
    phone: '+254712345679',
    vehicle: 'KCA 124B',
    status: 'available',
    tripsCompleted: 312,
    rating: 4.9,
    joinDate: '2021-08-15',
  },
  {
    id: '3',
    name: 'Samuel Kipchoge',
    idNumber: '12345680',
    phone: '+254712345680',
    vehicle: 'KCA 125C',
    status: 'off_duty',
    tripsCompleted: 198,
    rating: 4.6,
    joinDate: '2023-01-20',
  },
];

export default function CollectionDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.idNumber.includes(searchQuery)
  );

  const onRouteCount = drivers.filter((d) => d.status === 'on_route').length;
  const totalTrips = drivers.reduce((sum, d) => sum + d.tripsCompleted, 0);
  const avgRating = (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drivers Management</h1>
          <p className="text-muted-foreground">Monitor driver performance and assignments</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Drivers"
          value={drivers.length}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          title="On Route Now"
          value={onRouteCount}
          icon={<Truck className="h-8 w-8" />}
        />
        <StatCard
          title="Avg Rating"
          value={`${avgRating}⭐`}
          icon={<TrendingUp className="h-8 w-8" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by driver name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Drivers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trips Completed</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.idNumber}</TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.vehicle}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          driver.status === 'on_route'
                            ? 'default'
                            : driver.status === 'available'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {driver.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{driver.tripsCompleted}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(driver.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        {driver.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>{driver.joinDate}</TableCell>
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
