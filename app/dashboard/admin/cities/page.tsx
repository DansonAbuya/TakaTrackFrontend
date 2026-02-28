'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus } from 'lucide-react';
import { getTenantsAction, createTenantAction, type TenantResponse } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { parseActionError } from '@/lib/auth-context';

export default function AdminCitiesPage() {
  const { user, getAccessToken } = useAuth();
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isPlatformAdmin = user?.role === 'platform_admin';
  const token = getAccessToken();

  const reloadTenants = () => {
    setLoading(true);
    getTenantsAction(token)
      .then(setTenants)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load cities'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cities (Tenants)</h1>
          <p className="text-muted-foreground">
            Each city is a tenant with its own schema and white-label branding. Multi-tenancy per city.
          </p>
        </div>
        {isPlatformAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add City
              </Button>
            </DialogTrigger>
            <CreateTenantDialog onCreated={reloadTenants} getAccessToken={getAccessToken} />
          </Dialog>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Cities (Tenants)" value={tenants.length} />
        <StatCard title="Search" value={searchQuery || '—'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by city name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cities & White-Label</CardTitle>
          <CardDescription className="text-muted-foreground">
            Each row is one city (tenant) with its own database schema and branding (logo, primary color).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Primary color</TableHead>
                    <TableHead>Contact email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {t.logoUrl ? (
                          <img
                            src={t.logoUrl}
                            alt={t.name}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>
                        {t.primaryColor ? (
                          <span
                            className="inline-block w-6 h-6 rounded border"
                            style={{ backgroundColor: t.primaryColor }}
                            title={t.primaryColor}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{t.contactEmail || '—'}</TableCell>
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

function CreateTenantDialog({ onCreated, getAccessToken }: { onCreated: () => void; getAccessToken: () => string | null }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [mpesaPaybill, setMpesaPaybill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await createTenantAction(
        {
          name: name.trim(),
          slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
          logoUrl: logoUrl.trim() || undefined,
          primaryColor: primaryColor.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          mpesaPaybill: mpesaPaybill.trim() || undefined,
        },
        getAccessToken()
      );
      onCreated();
      setName('');
      setSlug('');
      setLogoUrl('');
      setPrimaryColor('');
      setContactEmail('');
      setMpesaPaybill('');
    } catch (e) {
      setErr(parseActionError(e)?.message ?? 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add city</DialogTitle>
        <DialogDescription>
          Each city is a tenant with its own schema and white-label (logo, primary color). Set branding for this city.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Slug (URL-safe)</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. acme"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Logo URL</label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Primary color</label>
          <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#0066cc" />
        </div>
        <div>
          <label className="text-sm font-medium">Contact email</label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">M-Pesa paybill</label>
          <Input value={mpesaPaybill} onChange={(e) => setMpesaPaybill(e.target.value)} />
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
