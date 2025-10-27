// Utility functions for formatting

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatPercent = (percent) => {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getChangeColor = (value) => {
  if (value > 0) return 'text-finance-profit';
  if (value < 0) return 'text-finance-loss';
  return 'text-finance-neutral';
};
