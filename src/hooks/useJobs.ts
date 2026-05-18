import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type JobStatus = 'Applied' | 'Interview' | 'Rejected' | 'Offer';

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  role: string;
  application_date: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  company_name: string;
  role: string;
  application_date: string;
  status: JobStatus;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
}

interface ApiJob {
  id: number;
  user_id: number;
  company: string;
  role: string;
  status: JobStatus;
  location?: string;
  notes?: string;
  created_at: string;
}

function mapApiJobToJob(apiJob: ApiJob): Job {
  return {
    id: String(apiJob.id),
    user_id: String(apiJob.user_id),
    company_name: apiJob.company,
    role: apiJob.role,
    application_date: apiJob.created_at.split('T')[0],
    status: apiJob.status,
    created_at: apiJob.created_at,
    updated_at: apiJob.created_at,
  };
}

export function useJobs() {
  const { user, getToken } = useAuth();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data: ApiJob[] = await res.json();
      return data.map(mapApiJobToJob);
    },
    enabled: !!user,
  });

  const createJob = useMutation({
    mutationFn: async (input: CreateJobInput) => {
      const token = getToken();
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: input.company_name,
          role: input.role,
          status: input.status,
          location: '',
          notes: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to create job');
      const data: ApiJob = await res.json();
      return mapApiJobToJob(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job application added!');
    },
    onError: (error) => {
      toast.error('Failed to add job: ' + error.message);
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, ...input }: UpdateJobInput) => {
      const token = getToken();
      const res = await fetch(`/api/jobs?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: (input as CreateJobInput).company_name,
          role: input.role,
          status: input.status,
          location: '',
          notes: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update job');
      const data: ApiJob = await res.json();
      return mapApiJobToJob(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated!');
    },
    onError: (error) => {
      toast.error('Failed to update job: ' + error.message);
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      const res = await fetch(`/api/jobs?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete job');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete job: ' + error.message);
    },
  });

  return {
    jobs: jobsQuery.data ?? [],
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    createJob,
    updateJob,
    deleteJob,
  };
}
