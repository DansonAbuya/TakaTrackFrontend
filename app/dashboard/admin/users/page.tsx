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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { getUsersAction, createUserAction, getTenantsAction, type UserListDto, type TenantResponse } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';

const ROLES = [
  'PLATFORM_ADMIN',
  'CITY_MANAGER',
  'ESTATE_MANAGER',
  'COLLECTION_MANAGER',
  'DRIVER',
  'YOUTH',
  'RESIDENT',
] as const;

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const token = getAccessToken();

  const loadUsers = () => {
    setLoading(true);
    setError('');
    getUsersAction(token)
      .then(setUsers)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      platform_admin: 'destructive',
      city_manager: 'default',
      estate_manager: 'secondary',
      collection_manager: 'secondary',
      driver: 'outline',
      youth: 'outline',
      resident: 'outline',
    };
    return map[role?.toLowerCase()] ?? 'outline';
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <AddUserButton onCreated={loadUsers} getAccessToken={getAccessToken} />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Active Users" value={users.filter((u) => u.active).length} />
        <StatCard title="Inactive Users" value={users.filter((u) => !u.active).length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by email, role or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant (City)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No users found. Add a user to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.tenantName ?? '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.active ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-gray-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddUserButton({
  onCreated,
  getAccessToken,
}: {
  onCreated: () => void;
  getAccessToken: () => string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <AddUserDialog
        onCreated={() => {
          onCreated();
          setOpen(false);
        }}
        getAccessToken={getAccessToken}
      />
    </Dialog>
  );
}

function AddUserDialog({
  onCreated,
  getAccessToken,
}: {
  onCreated: () => void;
  getAccessToken: () => string | null;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLES[1]); // CITY_MANAGER default
  const [tenantId, setTenantId] = useState<string>('');
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    getTenantsAction(getAccessToken())
      .then(setTenants)
      .catch(() => setTenants([]));
  }, [getAccessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const tid = tenantId ? Number(tenantId) : tenants[0]?.id;
    if (!tid) {
      setErr('Select a tenant (city).');
      return;
    }
    if (!email.trim()) {
      setErr('Email is required.');
      return;
    }
    setSubmitting(true);
    try {
      await createUserAction(
        { email: email.trim().toLowerCase(), role: role.trim(), tenantId: tid },
        getAccessToken()
      );
      onCreated();
      setEmail('');
      setRole(ROLES[1]);
      setTenantId('');
      setErr('');
    } catch (e) {
      setErr(parseActionError(e)?.message ?? 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add User</DialogTitle>
        <DialogDescription>
          Create a user account. A temporary password will be sent to their email. They must change it on first login.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tenant (City)</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
          >
            <option value="">Select city...</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.slug})
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create user'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}
