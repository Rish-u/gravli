import { formatDistanceToNow } from 'date-fns';

export const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp) return 'just now';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'just now';
  }
};

export const formatSubStatus = (status: string | null): string => {
  if (!status) return 'Awaiting deliverer updates...';
  switch(status) {
    case 'reached-cafe': return 'Reached the cafe';
    case 'picked-up': return 'Order picked up';
    default: return 'In progress';
  }
};

export const getStatusColor = (status: string): string => {
  switch(status) {
    case 'open': return '#22c55e';
    case 'in-progress': return '#f59e0b';
    case 'completed': return '#3b82f6';
    default: return '#6b7280';
  }
};
