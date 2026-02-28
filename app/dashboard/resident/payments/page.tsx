'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getInvoicesAction, initiateMpesaAction, type Invoice } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { useBranding } from '@/lib/branding-context';
import { parseActionError } from '@/lib/auth-context';

export default function ResidentPaymentsPage() {
  const { branding } = useBranding();
  const { getAccessToken } = useAuth();
  const token = getAccessToken();
  const [profileId, setProfileId] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaSubmitting, setMpesaSubmitting] = useState(false);

  useEffect(() => {
    const pid = profileId.trim();
    if (!pid) {
      setInvoices([]);
      return;
    }
    const id = Number(pid);
    if (Number.isNaN(id)) return;
    setLoading(true);
    getInvoicesAction(id, token)
      .then(setInvoices)
      .catch((e) => setError(parseActionError(e)?.message ?? 'Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [profileId, token]);

  const paidAmount = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingAmount = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingInvoices = invoices.filter((i) => i.status !== 'PAID');

  const handlePayClick = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPaymentModal(true);
  };

  const handleMpesa = async () => {
    if (!selectedInvoice || !phoneNumber.trim()) return;
    setMpesaSubmitting(true);
    setError('');
    try {
      await initiateMpesaAction(selectedInvoice.id, phoneNumber.trim(), token);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPhoneNumber('');
      setInvoices((prev) => prev.map((i) => (i.id === selectedInvoice.id ? { ...i, status: 'PENDING' } : i)));
    } catch (e) {
      setError(parseActionError(e)?.message ?? 'M-Pesa initiate failed');
    } finally {
      setMpesaSubmitting(false);
    }
  };

  const paybill = branding?.mpesaPaybill || '—';

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View invoices and pay via M-Pesa (use your resident profile ID)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your resident profile ID</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your resident profile ID (number)"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            type="number"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Amount paid</p>
            <p className="text-2xl font-bold mt-2 text-green-500">KES {paidAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter((i) => i.status === 'PAID').length} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-2 text-yellow-500">KES {pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{pendingInvoices.length} invoice(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !profileId.trim() ? (
            <p className="text-muted-foreground">Enter your resident profile ID above.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>KES {Number(inv.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inv.status === 'PAID' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Button size="sm" onClick={() => handlePayClick(inv)}>
                            Pay now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {invoices.length === 0 && profileId.trim() && (
                <p className="text-muted-foreground py-4">No invoices found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay with M-Pesa</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-3xl font-bold">KES {Number(selectedInvoice.amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Due: {selectedInvoice.dueDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium">M-Pesa phone number</label>
                <Input
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Paybill: {paybill}. You will receive an STK push on your phone.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMpesa} disabled={mpesaSubmitting || !phoneNumber.trim()}>
              {mpesaSubmitting ? 'Sending...' : 'Send M-Pesa prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>• Use your resident profile ID to load invoices. Pay via M-Pesa when prompted.</p>
          <p>• Paybill for this tenant: <strong>{paybill}</strong></p>
        </CardContent>
      </Card>
    </div>
  );
}
