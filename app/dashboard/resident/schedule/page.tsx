'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Truck, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface ScheduleItem {
  date: string;
  day: string;
  time: string;
  route: string;
  driver: string;
  vehicle: string;
  status: 'completed' | 'upcoming' | 'missed';
}

const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    date: '2024-02-24',
    day: 'Saturday',
    time: '06:30 AM - 08:00 AM',
    route: 'Kilimani North Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    status: 'completed',
  },
  {
    date: '2024-03-02',
    day: 'Saturday',
    time: '06:30 AM - 08:00 AM',
    route: 'Kilimani North Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    status: 'upcoming',
  },
  {
    date: '2024-03-09',
    day: 'Saturday',
    time: '06:30 AM - 08:00 AM',
    route: 'Kilimani North Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    status: 'upcoming',
  },
  {
    date: '2024-03-16',
    day: 'Saturday',
    time: '06:30 AM - 08:00 AM',
    route: 'Kilimani North Loop',
    driver: 'James Mwangi',
    vehicle: 'KCA 123A',
    status: 'upcoming',
  },
];

export default function ResidentSchedulePage() {
  const [schedule] = useState(MOCK_SCHEDULE);

  const nextCollection = schedule.find((s) => s.status === 'upcoming');

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Collection Schedule</h1>
        <p className="text-muted-foreground">View your waste collection schedule</p>
      </div>

      {nextCollection && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Next Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-bold">{nextCollection.day}, {nextCollection.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Window</p>
                <p className="text-lg font-bold">{nextCollection.time}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="text-lg font-bold">{nextCollection.driver}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="text-lg font-bold">{nextCollection.vehicle}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Please ensure your waste bin is accessible and placed outside your gate before 06:00 AM
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                  item.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'default'
                          : item.status === 'upcoming'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {item.status}
                    </Badge>
                    <p className="font-medium">{item.day}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{item.route}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Driver: {item.driver} • Vehicle: {item.vehicle}</span>
                    </div>
                  </div>
                </div>

                {item.status === 'completed' && (
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            • Collections are scheduled for <strong>every Saturday morning</strong> between 6:00 AM and 8:30 AM
          </p>
          <p>
            • Place your waste bin outside your gate the evening before collection
          </p>
          <p>
            • Only waste in authorized bins will be collected. Ensure your bin is clearly marked with your unit number
          </p>
          <p>
            • If you missed a collection, you will be notified. Contact support for rescheduling
          </p>
          <p>
            • During public holidays, collection may be rescheduled. Check your notifications for updates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
