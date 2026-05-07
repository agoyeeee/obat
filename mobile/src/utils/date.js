export const formatDateDDMMYY = (value) => {
  if (!value) return '-';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = String(value.getFullYear() % 100).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  const raw = String(value);
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1].slice(2)}`;
  }

  const dmyMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[1]}-${dmyMatch[2]}-${dmyMatch[3].slice(2)}`;
  }

  const dmyShortMatch = raw.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (dmyShortMatch) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = String(parsed.getFullYear() % 100).padStart(2, '0');
  return `${day}-${month}-${year}`;
};
