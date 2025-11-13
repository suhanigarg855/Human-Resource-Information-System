import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Leave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  profiles: {
    name: string;
    email: string;
  };
}

export default function Leaves() {
  const { isAdmin, user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, user]);

  const fetchLeaves = async () => {
    try {
      let query = supabase
        .from('leaves')
        .select(`
          *,
          profiles:employee_id (name, email)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && user) {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    
    const leaveData = {
      employee_id: user.id,
      leave_type: formData.get('leave_type') as 'sick' | 'vacation' | 'personal' | 'other',
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      reason: formData.get('reason') as string,
    };

    try {
      const { error } = await supabase
        .from('leaves')
        .insert([leaveData]);

      if (error) throw error;
      
      toast.success('Leave request submitted successfully');
      setDialogOpen(false);
      fetchLeaves();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const handleStatusUpdate = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({ status })
        .eq('id', leaveId);

      if (error) throw error;
      
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error('Failed to update leave status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? 'Review and manage leave requests' : 'Apply for leave and track your requests'}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leave_type">Leave Type</Label>
                <Select name="leave_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please provide a reason for your leave..."
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Leave Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Employee</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  {isAdmin && (
                    <TableCell>
                      <div>
                        <p className="font-medium">{leave.profiles.name}</p>
                        <p className="text-sm text-muted-foreground">{leave.profiles.email}</p>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="capitalize">{leave.leave_type.replace('_', ' ')}</TableCell>
                  <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {leave.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}