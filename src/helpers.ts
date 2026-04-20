// Mr Dokan Product Search — Helper functions
// Extracted for testability

// --- Types ---

export interface Product {
  productId?: number;
  productName?: string;
  genericName?: string;
  companyName?: string;
  dosageForm?: string;
  strength?: string;
  categoryName?: string;
  parentType?: string;
  retailPrice?: number;
  retailDiscountedPrice?: number;
  retailDiscount?: number;
  retailUnitName?: string;
  bulkDiscountedPrice?: number;
  bulkDiscount?: number;
  packSize?: string;
  inStock?: boolean;
  requiresPrescription?: boolean;
  dhakaOnly?: boolean;
  rating?: number;
  imageUrl?: string[];
  thumbnailUrl?: string;
  [key: string]: unknown;
}

export interface SearchDataPayload {
  searchKeyword?: string;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  items?: Product[];
}

export interface SearchApiResponse {
  succeeded?: boolean;
  message?: string;
  data?: SearchDataPayload;
  [key: string]: unknown;
}

// --- Format a single product into human-readable text ---

export function formatProduct(product: Product): string {
  const lines: string[] = [];

  if (product.productName) lines.push(`📦 **${product.productName}**`);
  if (product.genericName) lines.push(`   Generic: ${product.genericName}`);
  if (product.dosageForm && product.strength)
    lines.push(`   Form: ${product.dosageForm} | Strength: ${product.strength}`);
  else if (product.dosageForm) lines.push(`   Form: ${product.dosageForm}`);
  if (product.companyName) lines.push(`   Company: ${product.companyName}`);
  if (product.categoryName) lines.push(`   Category: ${product.categoryName}`);
  if (product.packSize) lines.push(`   Pack: ${product.packSize}`);

  // Price info
  const priceInfo: string[] = [];
  if (product.retailPrice !== undefined)
    priceInfo.push(`MRP: ৳${product.retailPrice.toFixed(2)}`);
  if (product.retailDiscountedPrice !== undefined && product.retailDiscount !== undefined)
    priceInfo.push(
      `Sale: ৳${product.retailDiscountedPrice.toFixed(2)} (${product.retailDiscount}% off)`
    );
  if (priceInfo.length > 0) lines.push(`   💰 ${priceInfo.join(" | ")}`);

  // Stock
  lines.push(`   ${product.inStock ? "✅ In Stock" : "❌ Out of Stock"}`);
  if (product.dhakaOnly) lines.push(`   ⚠️ Dhaka delivery only`);

  if (product.requiresPrescription !== undefined)
    lines.push(
      `   📋 Prescription Required: ${product.requiresPrescription ? "Yes" : "No"}`
    );

  return lines.join("\n");
}

// --- Extract products from nested API response ---

export function extractProducts(response: SearchApiResponse): Product[] {
  // Real API shape: { succeeded, data: { items: [...] } }
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  return [];
}

// --- Build the summary header ---

export function buildHeader(
  keyword: string,
  page: number,
  productCount: number,
  totalCount?: number,
  totalPages?: number
): string {
  return [
    `🔍 Search results for: **"${keyword}"**`,
    totalCount !== undefined ? `Total found: ${totalCount} (${totalPages} pages)` : "",
    `Showing page ${page} (${productCount} products)`,
    "─".repeat(40),
  ]
    .filter(Boolean)
    .join("\n");
}
