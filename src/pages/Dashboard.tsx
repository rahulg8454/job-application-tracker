import { useState } from 'react';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { JobCard } from '@/components/JobCard';
import { JobForm } from '@/components/JobForm';
import { StatusBadge } from '@/components/StatusBadge';
import { Job, JobStatus, useJobs } from '@/hooks/useJobs';

const statuses: JobStatus[] = ['Applied', 'Interview', 'Rejected', 'Offer'];

export default function Dashboard() {
  const { jobs, isLoading } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'All'>('All');

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const filteredJobs = filterStatus === 'All' 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status).length;
    return acc;
  }, {} as Record<JobStatus, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
              className={`rounded-lg border p-4 text-left transition-all hover:shadow-sm ${
                filterStatus === status 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={status} />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {statusCounts[status]}
              </p>
            </button>
          ))}
        </div>

        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {filterStatus === 'All' ? 'All Applications' : `${filterStatus} Applications`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              {filterStatus !== 'All' && (
                <button 
                  onClick={() => setFilterStatus('All')}
                  className="ml-2 text-primary hover:underline"
                >
                  Show all
                </button>
              )}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {filterStatus === 'All' ? 'No job applications yet' : `No ${filterStatus.toLowerCase()} applications`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filterStatus === 'All' 
                ? 'Start tracking your job search by adding your first application.'
                : 'Update a job status or add a new application.'}
            </p>
            {filterStatus === 'All' && (
              <Button onClick={() => setIsFormOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Job
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </main>

      <JobForm 
        open={isFormOpen} 
        onOpenChange={handleFormClose}
        editingJob={editingJob}
      />
    </div>
  );
}
