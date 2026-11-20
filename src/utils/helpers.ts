export function formatINR(amount: number, showDecimals = false): string {
  return (
    '₹' +
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })
  );
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getOrderStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Confirmed':
    case 'Delivered':
    case 'Completed':
    case 'Active':
    case 'Approved':
    case 'Success':
    case 'Connected':
    case 'Paid':
      return 'bg-[#ECFDF5] text-[#059669]';
    case 'Pending':
    case 'In Transit':
    case 'Unanswered':
    case 'Delayed':
    case 'Scheduled':
    case 'Paused':
      return 'bg-[#FFFBEB] text-[#D97706]';
    case 'Shipped':
    case 'Out for Delivery':
    case 'Transactional':
    case 'Marketing':
    case 'Conversion':
    case 'Read':
      return 'bg-[#EFF6FF] text-[#2563EB]';
    case 'Failed':
    case 'Failed Delivery':
    case 'Negative':
    case 'Disconnected':
      return 'bg-[#FEF2F2] text-[#DC2626]';
    default:
      return 'bg-[#F1F5F9] text-slate-600';
  }
}
