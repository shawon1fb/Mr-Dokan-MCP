# Mr Dokan MCP Server

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MCP](https://img.shields.io/badge/MCP-1.x-orange)

An **MCP (Model Context Protocol) Server** that allows AI agents (like the Mr Dokan n8n chatbot) to search the Mr Dokan online pharmacy product catalog in real-time.

## ✨ Features

- 🔍 **Product Search** — Search by medicine name or keyword
- 💰 **Price Info** — Shows MRP, discounted price and discount %
- ✅ **Stock Status** — Real-time in-stock / out-of-stock
- 📋 **Prescription Flag** — Whether a product requires a prescription
- 📦 **Product Details** — Generic name, dosage form, strength, pack size, company

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the project (or navigate to the directory)
cd n8n-MD-dokan

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

---

## 🧪 Testing

### 1. Test the Code (Unit & Integration)
This project includes both Unit Tests and real Integration Tests using `vitest`.

```bash
# Run unit tests (testing helpers and formatters)
npm run test

# Run integration tests (calls the live API)
npm run test:integration
```

### 2. Test the MCP Server (Visual UI)
The easiest way to test if the server is working and providing data correctly to an AI is by using the official **MCP Inspector**:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```
This will open a browser window.
1. Click **Connect**
2. Go to the **Tools** tab and select `search_products`
3. Enter a keyword (e.g. `"Napa"`) and click **Run Tool**

### 3. Test the MCP Server (CLI)
You can directly send a JSON-RPC payload to standard input to test the server:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_products","arguments":{"keyword":"Napa","page":1,"pageSize":3}}}' | node build/index.js 2>/dev/null
```

---

## 🐳 Docker Setup (Production)

We provide a multi-stage Dockerfile optimized for production.

### 1. Build the Image

To build the image locally, run:
```bash
docker build -t mr-dokan-mcp-server .
```

### 2. Push to Docker Hub (or any Registry)

If you want to use this image on a remote server, n8n cloud, or share it, you need to push it to a registry like Docker Hub:

```bash
# First, log in to Docker Hub (it will ask for your username and password)
docker login

# Tag the image with your Docker Hub username
docker tag mr-dokan-mcp-server yourusername/mr-dokan-mcp-server:latest

# Push the image to Docker Hub
docker push yourusername/mr-dokan-mcp-server:latest
```
*(Replace `yourusername` with your actual Docker Hub username)*

### 3. Run the Container

Since MCP servers communicate via `stdio`, you don't map ports. Instead, you run it interactively (or configure your MCP client to spawn the docker container):

```bash
docker run -i yourusername/mr-dokan-mcp-server:latest
```

---

## ⚙️ MCP Configuration

Add the following to your MCP client config (e.g., Claude Desktop, n8n, cursor, etc.):

### Option 1: Running natively via Node

```json
{
  "mcpServers": {
    "mr-dokan-products": {
      "command": "node",
      "args": ["/absolute/path/to/n8n-MD-dokan/build/index.js"]
    }
  }
}
```

### Option 2: Running via Docker

```json
{
  "mcpServers": {
    "mr-dokan-products": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mr-dokan-mcp-server"]
    }
  }
}
```

---

## 🛠 Available Tool

### `search_products`

Search for medicines and healthcare products in the Mr Dokan catalog.

| Argument   | Type   | Required | Default | Description                                       |
|------------|--------|----------|---------|---------------------------------------------------|
| `keyword`  | string | ✅ Yes   | —       | Medicine or product name (e.g. "Napa", "Paracetamol") |
| `page`     | number | ❌ No    | `1`     | Page number for pagination                        |
| `pageSize` | number | ❌ No    | `10`    | Results per page (max 50)                         |

**Example output:**
```text
🔍 Search results for: **"Napa"**
Total found: 16 (6 pages)
Showing page 1 (3 products)
────────────────────────────────────────

📦 **Napa Extra 500mg+65mg**
   Generic: Paracetamol + Caffeine
   Form: Tablet | Strength: 500mg+65mg
   Company: Beximco Pharma
   Category: Analgesics
   Pack: 1 Strip (10 Tablet)
   💰 MRP: ৳10.00 | Sale: ৳9.10 (9% off)
   ✅ In Stock
   📋 Prescription Required: No
```

---

## 🔌 API Reference

This server wraps the following upstream API:

```http
GET http://103.174.51.66:8081/api/catalog/product/search
  ?keyword={keyword}
  &page={page}
  &pageSize={pageSize}
```

## 🤖 Agent Persona

See [`requerment.md`](./requerment.md) for the full **Mr Dokan** AI customer support agent persona to use with this MCP server in n8n or similar workflow tools.
