/**
 * Integration tests — calls the REAL Mr Dokan catalog API.
 * Requires network access to http://103.174.51.66:8081
 *
 * Run: npm run test:integration
 */

import { describe, it, expect } from "vitest";
import axios from "axios";
import { extractProducts, buildHeader, formatProduct } from "../src/helpers.js";
import type { SearchApiResponse } from "../src/helpers.js";

const API_BASE = "http://103.174.51.66:8081";
const SEARCH_URL = `${API_BASE}/api/catalog/product/search`;
const TIMEOUT = 15_000; // 15s for real network call

describe("Integration: Product Search API", () => {
  it(
    "returns results for keyword 'Napa'",
    async () => {
      const response = await axios.get<SearchApiResponse>(SEARCH_URL, {
        params: { keyword: "Napa", page: 1, pageSize: 5 },
        headers: { accept: "*/*" },
        timeout: TIMEOUT,
      });

      expect(response.status).toBe(200);
      expect(response.data.succeeded).toBe(true);
      expect(response.data.data).toBeDefined();
      expect(response.data.data?.items).toBeInstanceOf(Array);
      expect(response.data.data!.items!.length).toBeGreaterThan(0);
      expect(response.data.data?.totalCount).toBeGreaterThan(0);
    },
    TIMEOUT
  );

  it(
    "extracts products correctly from real API response",
    async () => {
      const response = await axios.get<SearchApiResponse>(SEARCH_URL, {
        params: { keyword: "Paracetamol", page: 1, pageSize: 3 },
        headers: { accept: "*/*" },
        timeout: TIMEOUT,
      });

      const products = extractProducts(response.data);
      expect(products.length).toBeGreaterThan(0);

      const first = products[0];
      expect(first.productName).toBeDefined();
      expect(typeof first.retailPrice).toBe("number");
      expect(typeof first.inStock).toBe("boolean");
      expect(typeof first.requiresPrescription).toBe("boolean");
    },
    TIMEOUT
  );

  it(
    "formats real API product without throwing",
    async () => {
      const response = await axios.get<SearchApiResponse>(SEARCH_URL, {
        params: { keyword: "Napa", page: 1, pageSize: 1 },
        headers: { accept: "*/*" },
        timeout: TIMEOUT,
      });

      const products = extractProducts(response.data);
      expect(products.length).toBeGreaterThan(0);

      const formatted = formatProduct(products[0]);
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toContain("📦");
    },
    TIMEOUT
  );

  it(
    "builds complete formatted output with header",
    async () => {
      const response = await axios.get<SearchApiResponse>(SEARCH_URL, {
        params: { keyword: "Napa", page: 1, pageSize: 5 },
        headers: { accept: "*/*" },
        timeout: TIMEOUT,
      });

      const products = extractProducts(response.data);
      const payload = response.data.data;

      const header = buildHeader(
        "Napa",
        1,
        products.length,
        payload?.totalCount,
        payload?.totalPages
      );

      expect(header).toContain("Napa");
      expect(header).toContain("Total found:");
      expect(header).toContain("─");

      const productList = products.map(formatProduct).join("\n\n---\n\n");
      const fullOutput = `${header}\n\n${productList}`;
      expect(fullOutput.length).toBeGreaterThan(100);
    },
    TIMEOUT
  );

  it(
    "returns empty items for a nonsense keyword",
    async () => {
      const response = await axios.get<SearchApiResponse>(SEARCH_URL, {
        params: {
          keyword: "XYZABC_NONEXISTENT_PRODUCT_12345",
          page: 1,
          pageSize: 5,
        },
        headers: { accept: "*/*" },
        timeout: TIMEOUT,
      });

      // API should succeed but return no items
      expect(response.status).toBe(200);
      const products = extractProducts(response.data);
      expect(products.length).toBe(0);
    },
    TIMEOUT
  );
});
