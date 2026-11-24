const integer = (value, label, min = 0) => {
  if (!Number.isSafeInteger(value) || value < min) throw new RangeError(`${label} must be a safe integer >= ${min}`);
  return BigInt(value);
};
const round = (n, d) => (n + d / 2n) / d;
const safe = n => {
  if (n > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Amount exceeds safe integer range');
  return Number(n);
};
const rate = (value, label) => {
  const n = integer(value, label);
  if (n > 10000n) throw new RangeError(`${label} cannot exceed 100%`);
  return n;
};

// Monetary values are integer kobo; quantities are thousandths of a unit.
// Admin and contingency use the line subtotal; tax uses the explicit base.
export function estimate(lines, { adminBps, contingencyBps, taxBps, taxBase } = {}) {
  if (!Array.isArray(lines) || lines.length === 0) throw new TypeError('At least one line is required');
  if (!['subtotal', 'subtotal_plus_charges'].includes(taxBase)) throw new RangeError('Explicit taxBase is required');
  const adminRate = rate(adminBps, 'adminBps');
  const contingencyRate = rate(contingencyBps, 'contingencyBps');
  const taxRate = rate(taxBps, 'taxBps');
  const ids = new Set();
  const calculated = lines.map(line => {
    if (typeof line?.id !== 'string' || !line.id.trim() || ids.has(line.id.trim())) throw new TypeError('Unique line ID required');
    ids.add(line.id.trim());
    const qty = integer(line.quantityMilli, 'quantityMilli', 1);
    const price = integer(line.unitPriceKobo, 'unitPriceKobo');
    return { id: line.id.trim(), quantityMilli: line.quantityMilli, unitPriceKobo: line.unitPriceKobo, totalKobo: safe(round(qty * price, 1000n)) };
  });
  const subtotal = calculated.reduce((sum, line) => sum + BigInt(line.totalKobo), 0n);
  const admin = round(subtotal * adminRate, 10000n);
  const contingency = round(subtotal * contingencyRate, 10000n);
  const taxable = taxBase === 'subtotal' ? subtotal : subtotal + admin + contingency;
  const tax = round(taxable * taxRate, 10000n);
  return { lines: calculated, subtotalKobo: safe(subtotal), adminKobo: safe(admin), contingencyKobo: safe(contingency), taxableKobo: safe(taxable), taxKobo: safe(tax), grandTotalKobo: safe(subtotal + admin + contingency + tax) };
}
