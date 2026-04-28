import type { OrderLine } from '../types';

const PKR = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Strips "Rs." / "PKR" / commas; returns a number or null. */
export function parsePkrToNumber(price: string | undefined | null): number | null {
  if (price == null || !String(price).trim()) return null;
  const digits = String(price)
    .replace(/rs\.?/gi, '')
    .replace(/pkr/gi, '')
    .replace(/[,\s]/g, '')
    .replace(/[^\d.-]/g, '');
  if (digits === '' || digits === '-') return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function formatPkr(n: number): string {
  return PKR.format(Math.round(n * 100) / 100);
}

const TAX_MULTIPLIER = 1.16; // Subtotal * 1.16 = final; GST = final - subtotal

function roundPkr2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function sumOrderLineAmount(line: OrderLine): number {
  const unit = parsePkrToNumber(line.item.price);
  if (unit == null) return 0;
  return unit * line.quantity;
}

export function subtotalFromOrder(lines: OrderLine[]): number {
  return lines.reduce((acc, line) => acc + sumOrderLineAmount(line), 0);
}

export function countItemsInOrder(lines: OrderLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

/** Final = subtotal * 1.16 exactly; GST = final - subtotal (2 dp). */
export function withPraGst16(subtotal: number) {
  const finalTotal = roundPkr2(subtotal * TAX_MULTIPLIER);
  const gst = roundPkr2(finalTotal - subtotal);
  return { gst, finalTotal, taxMultiplier: TAX_MULTIPLIER };
}
