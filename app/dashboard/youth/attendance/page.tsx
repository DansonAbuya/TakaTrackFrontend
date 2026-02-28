'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  day: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'half_day';
  hoursWorked?: number;
  dailyEarnings?: number;
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    date: '2024-02-24',
    day: 'Saturday',
    checkInTime: '07:00 AM',
    checkOutTime: '04:00 PM',
    status: 'present',
    hoursWorked: 9,
    dailyEarnings: 1800,
  },
  {
    date: '2024-02-23',
    day: 'Friday',
    checkInTime: '07:00 AM',
    checkOutTime: '04:00 PM',
    status: 'present',
    hoursWorked: 9,
    dailyEarnings: 1800,
  },
  {
    date: '2024-02-22',
    day: 'Thursday',
    checkInTime: '07:00 AM',
    checkOutTime: '12:00 PM',
    status: 'half_day',
    hoursWorked: 5,
    dailyEarnings: 1000,
  },
  {
    date: '2024-02-21',
    day: 'Wednesday',
    checkInTime: undefined,
    checkOutTime: undefined,
    status: 'absent',
    hoursWorked: 0,
    dailyEarnings: 0,
  },
  {
    date: '2024-02-20',
    day: 'Tuesday',
    checkInTime: '07:00 AM',
    checkOutTime: '04:00 PM',
    status: 'present',
    hoursWorked: 9,
    dailyEarnings: 1800,
  },
];

export default function YouthAttendancePage() {
  const [attendance] = useState(MOCK_ATTENDANCE);
  const [checkedIn, setCheckedIn] = useState(false);

  const presentDays = attendance.filter((a) => a.status === 'present').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
  const totalEarnings = attendance.reduce((sum, a) => sum + (a.dailyEarnings || 0), 0);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Track your work hours and earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Days Worked</p>
            <p className="text-3xl font-bold mt-2">{presentDays}</p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-3xl font-bold mt-2">{totalHours}</p>
            <p className="text-xs text-muted-foreground mt-1">Hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Earnings This Week</p>
            <p className="text-2xl font-bold mt-2 text-accent">KES {totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setCheckedIn(!checkedIn)}
            className={`${
              checkedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {checkedIn ? 'Check Out' : 'Check In'}
          </Button>
          {checkedIn && (
            <p className="text-sm text-green-500 ml-auto">Checked in at 07:00 AM</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendance.map((record, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  record.status === 'present'
                    ? 'bg-green-500/10 border-green-500/30'
                    : record.status === 'absent'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium">{record.day}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {record.checkInTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        In: {record.checkInTime}
                      </span>
                    )}
                    {record.checkOutTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Out: {record.checkOutTime}
                      </span>
                    )}
                    {record.hoursWorked && (
                      <span className="text-muted-foreground">
                        {record.hoursWorked} hrs
                      </span>
                    )}
                    {record.dailyEarnings && record.dailyEarnings > 0 && (
                      <span className="text-accent font-semibold flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        KES {record.dailyEarnings.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {record.status === 'present' && (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                  {record.status === 'absent' && (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-5 w-5" />
                    </div>
                  )}
                  {record.status === 'half_day' && (
                    <Badge variant="outline">Half Day</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Daily Rate:</span>
            <span className="font-medium">KES 200/hour</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Hours This Week:</span>
            <span className="font-medium">{totalHours} hours</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-medium">Total Earnings:</span>
            <span className="text-lg font-bold text-accent">KES {totalEarnings.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Payments are processed every Saturday. Next payment: 2024-02-24
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
