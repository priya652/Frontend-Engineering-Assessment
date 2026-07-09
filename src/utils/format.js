const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => currency.format(Number(value) || 0);

export const formatRating = (value) => (Number(value) || 0).toFixed(1);

/** "home-decoration" -> "Home Decoration" */
export const titleCase = (slug = '') =>
  slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

export const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Parses a user-typed price into a number, or null when blank/invalid. */
export const parsePrice = (raw) => {
  if (raw === '' || raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
};
