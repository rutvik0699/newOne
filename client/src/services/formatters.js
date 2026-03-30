/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

/**
 * Format a date string to a readable format
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format datetime
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format a number with commas
 */
export const formatNumber = (num) =>
  new Intl.NumberFormat('en-US').format(num || 0);

/**
 * Convert orders to CSV and trigger download
 */
export const exportToCSV = (orders, filename = 'orders.csv') => {
  const headers = ['Order Number', 'Date', 'Status', 'Total Amount', 'Items', 'Notes'];
  const rows = orders.map((o) => [
    o.orderNumber,
    formatDate(o.orderDate),
    o.status,
    formatCurrency(o.totalAmount),
    o.items?.length || 0,
    o.notes || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
