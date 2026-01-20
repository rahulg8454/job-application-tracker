import { cn } from '@/lib/utils';
import { JobStatus } from '@/hooks/useJobs';

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusStyles: Record<JobStatus, string> = {
  Applied: 'bg-status-applied/10 text-status-applied border-status-applied/20',
  Interview: 'bg-status-interview/10 text-status-interview border-status-interview/20',
  Rejected: 'bg-status-rejected/10 text-status-rejected border-status-rejected/20',
  Offer: 'bg-status-offer/10 text-status-offer border-status-offer/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
