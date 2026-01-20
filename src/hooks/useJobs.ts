import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('application_date', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user,
  });

  const createJob = useMutation({
    mutationFn: async (input: CreateJobInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
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
      const { data, error } = await supabase
        .from('jobs')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
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
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
