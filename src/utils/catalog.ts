/**
 * Helper to deduce product category from product name, description, and SKU.
 * Aligns with database F&B catalog structure.
 */
export function deduceProductCategory(
  name: string = '',
  description: string = '',
  sku: string = ''
): string {
  const n = name.toLowerCase();
  const s = (sku || '').toUpperCase();

  // 1. Check Coffee
  if (
    s.includes('-ESP') ||
    s.includes('-AME') ||
    s.includes('-LAT') ||
    s.includes('-VLAT') ||
    s.includes('-MAC') ||
    s.includes('-CAP') ||
    s.includes('-KSG') ||
    /\b(espresso|americano|latte|cappuccino|macchiato|kopi|coffee|cold brew|flat white|piccolo|mocha)\b/i.test(n)
  ) {
    // Non-coffee exceptions like Matcha Latte or Tea Latte
    if (!/\b(matcha|tea|teh)\b/i.test(n)) {
      return 'Coffee';
    }
  }

  // 2. Check Pastry & Bakery
  if (
    s.includes('-CRS') ||
    s.includes('-PAIN') ||
    s.includes('-ALM') ||
    s.includes('-CIN') ||
    /\b(croissant|pain au|roll|danish|pastry|muffin|pie)\b/i.test(n)
  ) {
    return 'Pastry & Bakery';
  }

  // 3. Check Makanan & Snack
  if (
    s.includes('-CSW') ||
    s.includes('-CARB') ||
    s.includes('-NASI') ||
    s.includes('-TRF') ||
    /\b(nasi|pasta|sandwich|fries|carbonara|burger|goreng|spaghetti|mie|snack|truffle|wagyu|ayam|chicken)\b/i.test(n)
  ) {
    return 'Makanan & Snack';
  }

  // 4. Check Tea & Non-Coffee
  if (
    s.includes('-MAT') ||
    s.includes('-CHOC') ||
    s.includes('-TEG') ||
    s.includes('-TLCH') ||
    /\b(matcha|tea|teh|chocolate|cokelat|hazelnut|lychee|berry|juice|lemon|earl grey)\b/i.test(n)
  ) {
    return 'Tea & Non-Coffee';
  }

  // Fallback to description analysis
  const text = `${name} ${description} ${sku}`.toLowerCase();
  if (/\b(nasi|pasta|sandwich|fries|carbonara|burger|goreng|spaghetti|mie|snack|truffle|wagyu)\b/i.test(text)) {
    return 'Makanan & Snack';
  }
  if (/\b(croissant|pain au|pastry|cake|muffin|danish)\b/i.test(text)) {
    return 'Pastry & Bakery';
  }
  if (/\b(espresso|americano|cappuccino|macchiato|kopi|coffee)\b/i.test(text)) {
    return 'Coffee';
  }
  if (/\b(matcha|tea|teh|chocolate|cokelat|lychee)\b/i.test(text)) {
    return 'Tea & Non-Coffee';
  }

  return 'Lainnya';
}
