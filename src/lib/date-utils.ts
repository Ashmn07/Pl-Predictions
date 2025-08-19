// Date utility functions for formatting match times and dates

// Helper function to format match time
export const formatMatchTime = (kickoff: string): string => {
  const date = new Date(kickoff);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Helper function to format match date
export const formatMatchDate = (kickoff: string): string => {
  const date = new Date(kickoff);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};