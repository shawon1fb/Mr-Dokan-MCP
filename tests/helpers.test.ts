import { describe, it, expect } from "vitest";
import { formatProduct, extractProducts, buildHeader } from "../src/helpers.js";
import type { Product, SearchApiResponse } from "../src/helpers.js";

// --- formatProduct ---

describe("formatProduct", () => {
  it("shows product name", () => {
    const p: Product = { productName: "Napa Extra" };
    expect(formatProduct(p)).toContain("Napa Extra");
  });

  it("shows generic name when available", () => {
    const p: Product = { productName: "Napa Extra", genericName: "Paracetamol" };
    expect(formatProduct(p)).toContain("Paracetamol");
  });

  it("shows dosage form and strength together", () => {
    const p: Product = { dosageForm: "Tablet", strength: "500 mg" };
    const result = formatProduct(p);
    expect(result).toContain("Tablet");
    expect(result).toContain("500 mg");
  });

  it("shows dosage form alone when no strength", () => {
    const p: Product = { dosageForm: "Syrup" };
    expect(formatProduct(p)).toContain("Syrup");
  });

  it("shows MRP formatted to 2 decimal places", () => {
    const p: Product = { retailPrice: 10 };
    expect(formatProduct(p)).toContain("৳10.00");
  });

  it("shows sale price with discount percentage", () => {
    const p: Product = {
      retailPrice: 100,
      retailDiscountedPrice: 90,
      retailDiscount: 10,
    };
    const result = formatProduct(p);
    expect(result).toContain("৳90.00");
    expect(result).toContain("10% off");
  });

  it("shows ✅ In Stock when inStock is true", () => {
    const p: Product = { inStock: true };
    expect(formatProduct(p)).toContain("✅ In Stock");
  });

  it("shows ❌ Out of Stock when inStock is false", () => {
    const p: Product = { inStock: false };
    expect(formatProduct(p)).toContain("❌ Out of Stock");
  });

  it("shows Dhaka only warning when dhakaOnly is true", () => {
    const p: Product = { dhakaOnly: true };
    expect(formatProduct(p)).toContain("Dhaka delivery only");
  });

  it("does NOT show Dhaka warning when dhakaOnly is false", () => {
    const p: Product = { dhakaOnly: false };
    expect(formatProduct(p)).not.toContain("Dhaka delivery only");
  });

  it("shows prescription required: Yes", () => {
    const p: Product = { requiresPrescription: true };
    expect(formatProduct(p)).toContain("Prescription Required: Yes");
  });

  it("shows prescription required: No", () => {
    const p: Product = { requiresPrescription: false };
    expect(formatProduct(p)).toContain("Prescription Required: No");
  });

  it("handles completely empty product object gracefully", () => {
    const p: Product = {};
    expect(() => formatProduct(p)).not.toThrow();
  });
});

// --- extractProducts ---

describe("extractProducts", () => {
  it("extracts items from real API response shape { data: { items: [] } }", () => {
    const response: SearchApiResponse = {
      succeeded: true,
      data: {
        items: [{ productName: "Napa" }, { productName: "Paracetamol" }],
        totalCount: 2,
      },
    };
    const result = extractProducts(response);
    expect(result).toHaveLength(2);
    expect(result[0].productName).toBe("Napa");
  });

  it("returns empty array when data is missing", () => {
    const response: SearchApiResponse = { succeeded: true };
    expect(extractProducts(response)).toEqual([]);
  });

  it("returns empty array when items is empty", () => {
    const response: SearchApiResponse = {
      succeeded: true,
      data: { items: [] },
    };
    expect(extractProducts(response)).toEqual([]);
  });

  it("returns empty array when items is not an array", () => {
    const response: SearchApiResponse = {
      succeeded: true,
      data: {} as never,
    };
    expect(extractProducts(response)).toEqual([]);
  });
});

// --- buildHeader ---

describe("buildHeader", () => {
  it("includes keyword in header", () => {
    expect(buildHeader("Napa", 1, 5, 16, 4)).toContain("Napa");
  });

  it("includes total count and pages when provided", () => {
    const header = buildHeader("Napa", 1, 5, 16, 4);
    expect(header).toContain("Total found: 16");
    expect(header).toContain("4 pages");
  });

  it("omits total info when totalCount is undefined", () => {
    const header = buildHeader("Napa", 1, 5, undefined, undefined);
    expect(header).not.toContain("Total found");
  });

  it("shows product count on the current page", () => {
    const header = buildHeader("Napa", 2, 3, 16, 4);
    expect(header).toContain("3 products");
    expect(header).toContain("page 2");
  });

  it("includes separator line", () => {
    const header = buildHeader("Napa", 1, 5, 16, 4);
    expect(header).toContain("─");
  });
});
