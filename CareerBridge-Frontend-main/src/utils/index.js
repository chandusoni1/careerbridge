export * from './storage';

export const getInitials = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
