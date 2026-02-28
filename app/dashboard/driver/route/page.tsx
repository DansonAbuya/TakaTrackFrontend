'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, AlertCircle, MapPin, Clock, Truck, Navigation } from 'lucide-react';

interface Stop {
  id: string;
  sequence: number;
  residentName: string;
  address: string;
  estimatedArrival: string;
  status: 'pending' | 'collected' | 'missed';
  wasteWeight?: number;
}

interface Route {
  id: string;
  name: string;
  vehicle: string;
  totalDistance: number;
  totalStops: number;
  startTime: string;
  estimatedEndTime: string;
  currentLocation: string;
  status: 'scheduled' | 'active' | 'completed';
  stops: Stop[];
}

const MOCK_ROUTE: Route = {
  id: 'route_1',
  name: 'Kilimani North Loop',
  vehicle: 'KCA 123A',
  totalDistance: 18.5,
  totalStops: 24,
  startTime: '06:00 AM',
  estimatedEndTime: '08:30 AM',
  currentLocation: 'Stop 8 - Kibagare Lane',
  status: 'active',
  stops: [
    {
      id: '1',
      sequence: 1,
      residentName: 'John Doe',
      address: 'Kilimani Estate, Block A',
      estimatedArrival: '06:05 AM',
      status: 'collected',
      wasteWeight: 45,
    },
    {
      id: '2',
      sequence: 2,
      residentName: 'Jane Smith',
      address: 'Kilimani Estate, Block B',
      estimatedArrival: '06:12 AM',
      status: 'collected',
      wasteWeight: 38,
    },
    {
      id: '3',
      sequence: 3,
      residentName: 'Alice Johnson',
      address: 'Kibagare Lane',
      estimatedArrival: '06:20 AM',
      status: 'collected',
      wasteWeight: 52,
    },
    {
      id: '4',
      sequence: 4,
      residentName: 'Bob Wilson',
      address: 'Kibagare Avenue',
      estimatedArrival: '06:28 AM',
      status: 'collected',
      wasteWeight: 41,
    },
    {
      id: '5',
      sequence: 5,
      residentName: 'Carol White',
      address: 'Garden Estate',
      estimatedArrival: '06:35 AM',
      status: 'collected',
      wasteWeight: 48,
    },
    {
      id: '6',
      sequence: 6,
      residentName: 'David Brown',
      address: 'Forest Avenue',
      estimatedArrival: '06:42 AM',
      status: 'collected',
      wasteWeight: 55,
    },
    {
      id: '7',
      sequence: 7,
      residentName: 'Eve Taylor',
      address: 'Park View',
      estimatedArrival: '06:50 AM',
      status: 'collected',
      wasteWeight: 39,
    },
    {
      id: '8',
      sequence: 8,
      residentName: 'Frank Miller',
      address: 'Valley Road',
      estimatedArrival: '06:58 AM',
      status: 'pending',
      wasteWeight: undefined,
    },
    {
      id: '9',
      sequence: 9,
      residentName: 'Grace Lee',
      address: 'Hill Lane',
      estimatedArrival: '07:05 AM',
      status: 'pending',
      wasteWeight: undefined,
    },
  ],
};

export default function DriverRoutePage() {
  const [route, setRoute] = useState<Route>(MOCK_ROUTE);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const totalCollected = route.stops
    .filter((s) => s.status === 'collected')
    .reduce((sum, s) => sum + (s.wasteWeight || 0), 0);
  const completedStops = route.stops.filter((s) => s.status === 'collected').length;
  const progressPercent = (completedStops / route.totalStops) * 100;

  const handleCompleteStop = (stopId: string) => {
    setRoute({
      ...route,
      stops: route.stops.map((stop) =>
        stop.id === stopId ? { ...stop, status: 'collected' as const, wasteWeight: 40 } : stop
      ),
    });
  };

  const handleMissedStop = (stopId: string) => {
    setRoute({
      ...route,
      stops: route.stops.map((stop) =>
        stop.id === stopId ? { ...stop, status: 'missed' as const } : stop
      ),
    });
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{route.name}</h1>
          <p className="text-muted-foreground">{route.currentLocation}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={gpsEnabled ? 'default' : 'outline'}
            onClick={() => setGpsEnabled(!gpsEnabled)}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            GPS: {gpsEnabled ? 'On' : 'Off'}
          </Button>
          <Button
            variant={offlineMode ? 'default' : 'outline'}
            onClick={() => setOfflineMode(!offlineMode)}
          >
            {offlineMode ? 'Offline' : 'Online'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold mt-2">
                {completedStops}/{route.totalStops} stops
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Waste Collected</p>
            <p className="text-2xl font-bold mt-2">{totalCollected} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Distance</p>
            <p className="text-2xl font-bold mt-2">{route.totalDistance} km</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Est. End Time</p>
            <p className="text-2xl font-bold mt-2">{route.estimatedEndTime}</p>
          </CardContent>
        </Card>
      </div>

      {offlineMode && (
        <Card className="border-yellow-500 bg-yellow-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-500 font-medium">
              Offline Mode Active - Data will sync when you reconnect to the internet
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Route Stops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {route.stops.map((stop, index) => (
              <div
                key={stop.id}
                className={`p-4 rounded-lg border ${
                  stop.status === 'collected'
                    ? 'bg-green-500/10 border-green-500/30'
                    : stop.status === 'missed'
                    ? 'bg-red-500/10 border-red-500/30'
                    : index === route.stops.findIndex((s) => s.status === 'pending')
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={stop.status === 'collected' ? 'default' : 'outline'}>
                        Stop {stop.sequence}
                      </Badge>
                      {stop.status === 'collected' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {stop.status === 'missed' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium">{stop.residentName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {stop.address}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Est: {stop.estimatedArrival}
                    </p>
                    {stop.wasteWeight && (
                      <p className="text-sm font-semibold text-primary mt-2">
                        {stop.wasteWeight} kg collected
                      </p>
                    )}
                  </div>
                  {stop.status === 'pending' && (
                    <div className="flex gap-2 flex-col">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteStop(stop.id)}
                        className="whitespace-nowrap"
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleMissedStop(stop.id)}
                        className="whitespace-nowrap"
                      >
                        Missed
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vehicle:</span>
            <span className="font-medium">{route.vehicle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Time:</span>
            <span className="font-medium">{route.startTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Distance:</span>
            <span className="font-medium">{route.totalDistance} km</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-medium">Total Waste:</span>
            <span className="text-lg font-bold">{totalCollected} kg</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
