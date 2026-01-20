import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Building2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Job, JobStatus, useJobs } from '@/hooks/useJobs';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
}

const statuses: JobStatus[] = ['Applied', 'Interview', 'Rejected', 'Offer'];

export function JobCard({ job, onEdit }: JobCardProps) {
  const { updateJob, deleteJob } = useJobs();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: JobStatus) => {
    setIsUpdating(true);
    await updateJob.mutateAsync({ id: job.id, status: newStatus });
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    await deleteJob.mutateAsync(job.id);
  };

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h3 className="truncate font-semibold text-foreground">
                {job.company_name}
              </h3>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {job.role}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(job.application_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusBadge status={job.status} />
            
            <Select
              value={job.status}
              onValueChange={(value) => handleStatusChange(value as JobStatus)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(job)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="ml-1.5">Edit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="ml-1.5">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job Application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your application to {job.company_name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
