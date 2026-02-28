'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Plus, Clock, CheckCircle, MessageSquare } from 'lucide-react';

interface Issue {
  id: string;
  type: string;
  date: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  description: string;
  resolution?: string;
}

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    type: 'Missed Collection',
    date: '2024-02-24',
    status: 'resolved',
    priority: 'high',
    description: 'Waste was not collected on Saturday morning',
    resolution: 'Driver rescheduled collection for Sunday 10 AM',
  },
  {
    id: '2',
    type: 'Billing Issue',
    date: '2024-02-22',
    status: 'in_progress',
    priority: 'medium',
    description: 'Charged twice for February payment',
    resolution: undefined,
  },
  {
    id: '3',
    type: 'Property Damage',
    date: '2024-02-20',
    status: 'open',
    priority: 'high',
    description: 'Bin damaged during collection',
    resolution: undefined,
  },
];

export default function ResidentIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'missed_collection',
    description: '',
  });

  const openIssues = issues.filter((i) => i.status === 'open').length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved').length;

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const newIssue: Issue = {
      id: String(issues.length + 1),
      type: formData.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      date: new Date().toISOString().split('T')[0],
      status: 'open',
      priority: 'medium',
      description: formData.description,
    };
    setIssues([...issues, newIssue]);
    setShowNewIssueForm(false);
    setFormData({ type: 'missed_collection', description: '' });
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Report an Issue</h1>
          <p className="text-muted-foreground">Track your service issues and complaints</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewIssueForm(true)}>
          <Plus className="h-4 w-4" />
          New Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Open Issues</p>
            <p className="text-3xl font-bold mt-2 text-red-500">{openIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-3xl font-bold mt-2 text-yellow-500">
              {issues.filter((i) => i.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-3xl font-bold mt-2 text-green-500">{resolvedIssues}</p>
          </CardContent>
        </Card>
      </div>

      {showNewIssueForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Report New Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Type</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="missed_collection">Missed Collection</option>
                  <option value="damaged_property">Damaged Property</option>
                  <option value="billing">Billing Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground min-h-24"
                  placeholder="Please describe your issue in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Submit Issue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewIssueForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Issue History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.type}</TableCell>
                    <TableCell>{issue.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          issue.priority === 'high'
                            ? 'destructive'
                            : issue.priority === 'medium'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {issue.status === 'resolved' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs">Resolved</span>
                          </>
                        )}
                        {issue.status === 'in_progress' && (
                          <>
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs">In Progress</span>
                          </>
                        )}
                        {issue.status === 'open' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs">Open</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {issue.description.substring(0, 40)}...
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            FAQs & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1">When should I report a missed collection?</p>
            <p className="text-muted-foreground">
              Report immediately if your waste was not collected during your scheduled time. We will rescheduled collection within 24 hours.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">How long does issue resolution take?</p>
            <p className="text-muted-foreground">
              Most issues are resolved within 3-5 business days. You'll receive updates via SMS and email.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">What if I need immediate assistance?</p>
            <p className="text-muted-foreground">
              For urgent issues, call our support line at 0712 345 678 during business hours (8 AM - 6 PM, Monday-Friday).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
