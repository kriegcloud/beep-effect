/**
 * Check if a date is today.
 */
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is yesterday.
 */
const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Calculate the difference in minutes between two dates.
 */
const differenceInMinutes = (dateA: Date, dateB: Date): number => {
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60));
};

/**
 * Calculate the difference in hours between two dates.
 */
const differenceInHours = (dateA: Date, dateB: Date): number => {
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60));
};

/**
 * Calculate the difference in days between two dates.
 */
const differenceInDays = (dateA: Date, dateB: Date): number => {
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Format a date as "MMMM d, yyyy" (e.g., "January 15, 2024").
 */
const formatLongDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

/**
 * Format a date as "MM/dd/yyyy" (e.g., "01/15/2024").
 */
const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDiscussionDate = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return formatLongDate(date);
};

export const formatCommentDate = (date: Date) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return formatShortDate(date);
};
