#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import axios from "axios";
import {
  type SearchApiResponse,
  extractProducts,
  formatProduct,
  buildHeader,
} from "./helpers.js";

// --- Config ---

export const API_BASE_URL = "http://103.174.51.66:8081";
export const SEARCH_ENDPOINT = "/api/catalog/product/search";

// --- MCP Server ---

export function registerTools(server: McpServer) {

// Tool: search_products
server.tool(
  "search_products",
  "Search for medicines and healthcare products in Mr Dokan's catalog. Returns product name, price, stock/availability, and prescription requirement.",
  {
    keyword: z
      .string()
      .describe(
        "The product or medicine name to search for (e.g. 'Napa', 'Paracetamol')"
      ),
  },
  async ({ keyword }) => {
    const page = 1;
    const pageSize = 10;
    try {
      const response = await axios.get<SearchApiResponse>(
        `${API_BASE_URL}${SEARCH_ENDPOINT}`,
        {
          params: { keyword, page, pageSize },
          headers: { accept: "*/*" },
          timeout: 10000,
        }
      );

      const products = extractProducts(response.data);

      if (products.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `❌ No products found for keyword: "${keyword}"\n\nPlease try a different search term.`,
            },
          ],
        };
      }

      const payload = response.data.data;
      const header = buildHeader(
        keyword,
        page,
        products.length,
        payload?.totalCount,
        payload?.totalPages
      );
      const productList = products
        .map(formatProduct)
        .join("\n\n" + "─".repeat(40) + "\n\n");

      return {
        content: [
          {
            type: "text",
            text: `${header}\n\n${productList}`,
          },
        ],
      };
    } catch (error: unknown) {
      let message = "Unknown error occurred";
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
          message =
            "Cannot connect to Mr Dokan product catalog API. The service may be temporarily unavailable.";
        } else if (error.response) {
          message = `API returned error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.code === "ECONNABORTED") {
          message =
            "Request timed out. The product catalog API is taking too long to respond.";
        } else {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      return {
        content: [
          {
            type: "text",
            text: `⚠️ Error searching products: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);
}

// --- Start ---

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;

  if (port) {
    // --- Streamable HTTP Transport ---
    const app = express();

    app.all("/mcp", async (req, res) => {
      const server = new McpServer({
        name: "mr-dokan-product-search",
        version: "1.0.0",
      });
      registerTools(server);

      const transport = new StreamableHTTPServerTransport();
      await server.connect(transport);

      await transport.handleRequest(req, res);
    });

    app.listen(port, () => {
      console.log(`✅ Mr Dokan MCP Server running on Streamable HTTP port ${port}`);
      console.log(`📡 MCP Endpoint: http://localhost:${port}/mcp`);
    });
  } else {
    // --- Stdio Transport ---
    const server = new McpServer({
      name: "mr-dokan-product-search",
      version: "1.0.0",
    });
    registerTools(server);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("✅ Mr Dokan MCP Server running on stdio");
  }
}

main().catch((err) => {
  console.error("❌ Fatal error starting MCP server:", err);
  process.exit(1);
});
