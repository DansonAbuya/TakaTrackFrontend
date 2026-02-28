'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAttendanceAction, markAttendanceAction, type WorkforceAttendance } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';
import { format } from 'date-fns';

export default function DriverAttendancePage() {
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const [profileId, setProfileId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<WorkforceAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    getAttendanceAction(selectedDate, token)
      .then(setAttendance)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [selectedDate, token]);

  const handleMark = async (present: boolean) => {
    const pid = Number(profileId);
    if (!pid) {
      setError('Enter your profile ID above');
      return;
    }
    setError('');
    setMarking(true);
    try {
      await markAttendanceAction(pid, selectedDate, present, token);
      setAttendance((prev) => {
        const existing = prev.find((a) => a.profileId === pid);
        if (existing) return prev.map((a) => (a.profileId === pid ? { ...a, present } : a));
        return [...prev, { id: 0, profileId: pid, attendanceDate: selectedDate, present } as WorkforceAttendance];
      });
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'Failed to mark');
    } finally {
      setMarking(false);
    }
  };

  const myRecord = attendance.find((a) => a.profileId === Number(profileId));
  const presentDays = attendance.filter((a) => a.present).length;
  const attendanceRate = attendance.length ? ((attendance.filter((a) => a.present).length / attendance.length) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Attendance Tracking</h1>
        <p className="text-muted-foreground">Manage your daily check-in (profile ID required)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your profile ID</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your driver profile ID (number)"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            type="number"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Attendance rate (this date)</p>
            <p className="text-3xl font-bold mt-2">{attendanceRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{presentDays} present</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Your status</p>
            <div className="mt-3">
              {myRecord ? (
                <Badge variant={myRecord.present ? 'default' : 'secondary'}>
                  {myRecord.present ? 'Present' : 'Absent'}
                </Badge>
              ) : (
                <p className="text-muted-foreground text-sm">Not marked</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Mark attendance</p>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => handleMark(true)}
                disabled={marking || !profileId}
                className="bg-green-500 hover:bg-green-600"
              >
                Mark present
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleMark(false)}
                disabled={marking || !profileId}
              >
                Mark absent
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance for {selectedDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    record.present ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div>
                    <p className="font-medium">Profile ID: {record.profileId}</p>
                    <p className="text-sm text-muted-foreground">{record.attendanceDate}</p>
                  </div>
                  <div>
                    {record.present ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Present</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Absent</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && <p className="text-muted-foreground">No records for this date.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
