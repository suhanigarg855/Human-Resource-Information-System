import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent';
  profiles: {
    name: string;
    email: string;
  };
}

export default function Attendance() {
  const { isAdmin, user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayMarked, setTodayMarked] = useState(false);

  useEffect(() => {
    fetchAttendance();
    checkTodayAttendance();
  }, [isAdmin, user, selectedDate]);

  const fetchAttendance = async () => {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          profiles:employee_id (name, email)
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (!isAdmin && user) {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttendance((data as Attendance[]) || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', user.id)
        .eq('date', today)
        .single();

      setTodayMarked(!!data);
    } catch (error) {
      setTodayMarked(false);
    }
  };

  const markAttendance = async (status: 'present' | 'absent') => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          employee_id: user.id,
          date: today,
          status,
        });

      if (error) throw error;
      
      toast.success(`Marked as ${status} for today`);
      setTodayMarked(true);
      fetchAttendance();
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error('Attendance already marked for today');
      } else {
        console.error('Error marking attendance:', error);
        toast.error('Failed to mark attendance');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'present' ? (
      <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
        Present
      </Badge>
    ) : (
      <Badge variant="destructive">Absent</Badge>
    );
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin ? 'View employee attendance records' : 'Mark your daily attendance and view history'}
        </p>
      </div>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {todayMarked ? (
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle className="h-5 w-5" />
                <span>Attendance already marked for today</span>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={() => markAttendance('present')}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Present
                </Button>
                <Button
                  onClick={() => markAttendance('absent')}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark Absent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Employee</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Marked At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record.id}>
                  {isAdmin && (
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.profiles.name}</p>
                        <p className="text-sm text-muted-foreground">{record.profiles.email}</p>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}