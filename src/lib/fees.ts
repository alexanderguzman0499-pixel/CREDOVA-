/**
 * Central definition of the marketplace's fee structure.
 * Both fees are intentionally lower than competitors (StubHub/SeatGeek ~15-20%
 * per side, FIFA resale platforms up to 15%) — this file is the single
 * source of truth so pricing never drifts between the API and the UI.
 */
export const SELLER_FEE_RATE = 0.07;
export const BUYER_FEE_RATE = 0.07;

export interface PriceBreakdown {
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  buyerFeeCents: number;
  sellerFeeCents: number;
  /** What the buyer pays, all-inclusive: subtotal + buyer fee. */
  totalChargedCents: number;
  /** What the seller receives after their fee is deducted. */
  sellerPayoutCents: number;
}

export function computePriceBreakdown(
  unitPriceCents: number,
  quantity: number,
): PriceBreakdown {
  const subtotalCents = unitPriceCents * quantity;
  const buyerFeeCents = Math.round(subtotalCents * BUYER_FEE_RATE);
  const sellerFeeCents = Math.round(subtotalCents * SELLER_FEE_RATE);

  return {
    unitPriceCents,
    quantity,
    subtotalCents,
    buyerFeeCents,
    sellerFeeCents,
    totalChargedCents: subtotalCents + buyerFeeCents,
    sellerPayoutCents: subtotalCents - sellerFeeCents,
  };
}

export function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
