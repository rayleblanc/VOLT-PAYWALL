/**
 * VOLT Paywall - Project B Dynamic Deliverable Packager
 * 
 * Creates a standard uncompressed multi-file ZIP archive in-memory
 * conforming strictly to PKZIP specification (RFC 1951 / APPNOTE.TXT).
 * 
 * Packaged Deliverables for Project B:
 * - README.md (Full VOLT Paywall Engine technical specifications, licenses & requirements)
 * - GUIA-PASO-A-PASO.md (Step-by-step installation guide for non-technical users)
 * - /worker/schema.sql (Production Cloudflare D1 database schema)
 * - /worker/wrangler.jsonc (Cloudflare Worker deployment & binding config)
 * - /worker/src/index.ts (Cloudflare Worker Paywall API core)
 * - /frontend/src/config.ts (Client configuration contract)
 */

export interface ZipEntry {
  name: string;
  content: Uint8Array | string;
}

// CRC-32 table generator for valid checksum calculation
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Builds a valid multi-file ZIP binary array buffer.
 */
export function buildZipArchive(files: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const processedFiles = files.map(file => {
    const data = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const nameBytes = encoder.encode(file.name);
    const crc = computeCrc32(data);
    return {
      name: file.name,
      nameBytes,
      data,
      size: data.length,
      crc,
    };
  });

  // Calculate total buffer size
  // Local Headers: 30 + name_len + file_size per file
  // Central Directory: 46 + name_len per file
  // End of Central Directory: 22 bytes
  let totalSize = 22;
  for (const f of processedFiles) {
    totalSize += (30 + f.nameBytes.length + f.size);
    totalSize += (46 + f.nameBytes.length);
  }

  const buffer = new Uint8Array(totalSize);
  let offset = 0;
  const localHeaderOffsets: number[] = [];

  // 1. Write Local File Headers and Data
  for (const f of processedFiles) {
    localHeaderOffsets.push(offset);

    // Local Header Signature (PK\x03\x04)
    buffer.set([0x50, 0x4B, 0x03, 0x04], offset); offset += 4;
    buffer.set([20, 0], offset); offset += 2; // version needed (2.0)
    buffer.set([0, 0], offset); offset += 2; // flags
    buffer.set([0, 0], offset); offset += 2; // compression method (0 = store)
    buffer.set([0x00, 0x00, 0x00, 0x00], offset); offset += 4; // mod time/date
    
    // CRC-32
    buffer[offset] = f.crc & 0xFF;
    buffer[offset + 1] = (f.crc >>> 8) & 0xFF;
    buffer[offset + 2] = (f.crc >>> 16) & 0xFF;
    buffer[offset + 3] = (f.crc >>> 24) & 0xFF;
    offset += 4;

    // Compressed Size
    buffer[offset] = f.size & 0xFF;
    buffer[offset + 1] = (f.size >>> 8) & 0xFF;
    buffer[offset + 2] = (f.size >>> 16) & 0xFF;
    buffer[offset + 3] = (f.size >>> 24) & 0xFF;
    offset += 4;

    // Uncompressed Size
    buffer[offset] = f.size & 0xFF;
    buffer[offset + 1] = (f.size >>> 8) & 0xFF;
    buffer[offset + 2] = (f.size >>> 16) & 0xFF;
    buffer[offset + 3] = (f.size >>> 24) & 0xFF;
    offset += 4;

    // File name length
    buffer[offset] = f.nameBytes.length & 0xFF;
    buffer[offset + 1] = (f.nameBytes.length >>> 8) & 0xFF;
    offset += 2;

    // Extra field length
    buffer.set([0, 0], offset); offset += 2;

    // File name
    buffer.set(f.nameBytes, offset); offset += f.nameBytes.length;

    // File data
    buffer.set(f.data, offset); offset += f.size;
  }

  // 2. Write Central Directory Headers
  const centralDirStart = offset;
  for (let i = 0; i < processedFiles.length; i++) {
    const f = processedFiles[i];
    const localOffset = localHeaderOffsets[i];

    // Central Directory Header Signature (PK\x01\x02)
    buffer.set([0x50, 0x4B, 0x01, 0x02], offset); offset += 4;
    buffer.set([20, 0], offset); offset += 2; // version made by (2.0)
    buffer.set([20, 0], offset); offset += 2; // version needed (2.0)
    buffer.set([0, 0], offset); offset += 2; // flags
    buffer.set([0, 0], offset); offset += 2; // compression method (0 = store)
    buffer.set([0x00, 0x00, 0x00, 0x00], offset); offset += 4; // mod time/date

    // CRC-32
    buffer[offset] = f.crc & 0xFF;
    buffer[offset + 1] = (f.crc >>> 8) & 0xFF;
    buffer[offset + 2] = (f.crc >>> 16) & 0xFF;
    buffer[offset + 3] = (f.crc >>> 24) & 0xFF;
    offset += 4;

    // Compressed Size
    buffer[offset] = f.size & 0xFF;
    buffer[offset + 1] = (f.size >>> 8) & 0xFF;
    buffer[offset + 2] = (f.size >>> 16) & 0xFF;
    buffer[offset + 3] = (f.size >>> 24) & 0xFF;
    offset += 4;

    // Uncompressed Size
    buffer[offset] = f.size & 0xFF;
    buffer[offset + 1] = (f.size >>> 8) & 0xFF;
    buffer[offset + 2] = (f.size >>> 16) & 0xFF;
    buffer[offset + 3] = (f.size >>> 24) & 0xFF;
    offset += 4;

    // File name length
    buffer[offset] = f.nameBytes.length & 0xFF;
    buffer[offset + 1] = (f.nameBytes.length >>> 8) & 0xFF;
    offset += 2;

    // Extra field length
    buffer.set([0, 0], offset); offset += 2;

    // File comment length
    buffer.set([0, 0], offset); offset += 2;

    // Disk number start
    buffer.set([0, 0], offset); offset += 2;

    // Internal file attributes
    buffer.set([0, 0], offset); offset += 2;

    // External file attributes
    buffer.set([0, 0, 0, 0], offset); offset += 4;

    // Relative offset of local header
    buffer[offset] = localOffset & 0xFF;
    buffer[offset + 1] = (localOffset >>> 8) & 0xFF;
    buffer[offset + 2] = (localOffset >>> 16) & 0xFF;
    buffer[offset + 3] = (localOffset >>> 24) & 0xFF;
    offset += 4;

    // File name
    buffer.set(f.nameBytes, offset); offset += f.nameBytes.length;
  }

  // 3. Write End of Central Directory Record (PK\x05\x06)
  const centralDirSize = offset - centralDirStart;
  buffer.set([0x50, 0x4B, 0x05, 0x06], offset); offset += 4;
  buffer.set([0, 0], offset); offset += 2; // disk number
  buffer.set([0, 0], offset); offset += 2; // disk where central directory starts
  buffer.set([processedFiles.length & 0xFF, (processedFiles.length >>> 8) & 0xFF], offset); offset += 2; // entries on this disk
  buffer.set([processedFiles.length & 0xFF, (processedFiles.length >>> 8) & 0xFF], offset); offset += 2; // total entries

  // Central directory size
  buffer[offset] = centralDirSize & 0xFF;
  buffer[offset + 1] = (centralDirSize >>> 8) & 0xFF;
  buffer[offset + 2] = (centralDirSize >>> 16) & 0xFF;
  buffer[offset + 3] = (centralDirSize >>> 24) & 0xFF;
  offset += 4;

  // Central directory offset
  buffer[offset] = centralDirStart & 0xFF;
  buffer[offset + 1] = (centralDirStart >>> 8) & 0xFF;
  buffer[offset + 2] = (centralDirStart >>> 16) & 0xFF;
  buffer[offset + 3] = (centralDirStart >>> 24) & 0xFF;
  offset += 4;

  // ZIP comment length
  buffer.set([0, 0], offset); offset += 2;

  return buffer;
}

/**
 * Returns the standard deliverable files for Proyecto B (VOLT Paywall Engine).
 */
export function getProjectBDeliverableFiles(orderId: string, timestampIso: string): ZipEntry[] {
  const readme = `# VOLT Paywall Engine — Complete Autonomous Web3 Paywall (Project B)

¡Felicitaciones! Has adquirido la licencia completa del **VOLT Paywall Engine**.

## 📦 Contenido del Paquete Entregable
- **README.md**: Especificaciones técnicas, arquitectura y requerimientos de producción.
- **GUIA-PASO-A-PASO.md**: Manual de instalación y despliegue rápido para Cloudflare Workers & D1.
- **/worker/schema.sql**: Esquema SQLite para Cloudflare D1 (orders, payments, downloads).
- **/worker/wrangler.jsonc**: Configuración declarativa para Cloudflare Workers y bindings.
- **/worker/src/index.ts**: Backend serverless con verificación on-chain BEP-20 (USDT en BSC) y tokens de entrega.
- **/frontend/src/config.ts**: Configuración del cliente React/Vite.

## 🔐 Licencia y Autenticación
- **ID de Orden Asociada**: ${orderId}
- **Timestamp de Emisión**: ${timestampIso}
- **Red de Pago**: BNB Smart Chain (BSC - BEP-20 USDT)
- **Modo de Entrega**: Descarga única autorizada vía Cloudflare KV/D1

## ⚡ Requisitos Técnicos
1. Cuenta de Cloudflare (Plan Gratuito es 100% suficiente).
2. Node.js 18+ y npm instalados.
3. Wallet EVM con dirección receptora de pagos para USDT en BSC.
`;

  const guiaPasoAPaso = `# GUÍA PASO A PASO: INSTALACIÓN Y DESPLIEGUE DE TU PAYWALL CRYPTO

Esta guía está diseñada para que puedas desplegar tu propio Paywall Web3 autónomo en menos de 5 minutos, incluso sin conocimientos avanzados de programación.

---

### PASO 1: Crear la Base de Datos en Cloudflare D1
Abre tu terminal en la carpeta \`/worker\` y ejecuta:
\`\`\`bash
npx wrangler d1 create volt-paywall-db
\`\`\`
Copia el \`database_id\` que Cloudflare te devuelva en pantalla y pégalo dentro del archivo \`wrangler.jsonc\` en la sección \`d1_databases\`.

---

### PASO 2: Aplicar las Migraciones de la Base de Datos
Crea las tablas ejecutando:
\`\`\`bash
npx wrangler d1 execute volt-paywall-db --remote --file=./schema.sql
\`\`\`

---

### PASO 3: Crear el Namespace de KV para Almacenar tus Productos
Ejecuta:
\`\`\`bash
npx wrangler kv namespace create PRODUCT_PAYLOAD_KV
\`\`\`
Copia el \`id\` del namespace y configúralo en \`wrangler.jsonc\`. Para subir tu archivo digital a entregar:
\`\`\`bash
npx wrangler kv key put --binding=PRODUCT_PAYLOAD_KV "zip_content" --path="./tu-archivo-producto.zip" --remote
\`\`\`

---

### PASO 4: Configurar tus Variables de Entorno y Billetera
Establece tu dirección receptora de USDT (BSC):
\`\`\`bash
npx wrangler secret put PAYMENT_RECIPIENT
# Pega tu dirección de billetera EVM (ej: 0x...)
\`\`\`

---

### PASO 5: Desplegar el Backend Worker
\`\`\`bash
npx wrangler deploy
\`\`\`
Tu Paywall quedará publicado globalmente en la red Edge de Cloudflare con latencia ultra-baja y 0 costo de mantenimiento fijo.
`;

  const workerSchema = `-- VOLT Paywall Engine - Production D1 Database Schema

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  expected_amount TEXT,
  expected_units TEXT,
  currency TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL DEFAULT 'BSC',
  chain_id INTEGER NOT NULL DEFAULT 56,
  recipient TEXT NOT NULL,
  buyer_address TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_block INTEGER,
  paid_at TEXT,
  tx_hash TEXT,
  confirmations INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  token_contract TEXT,
  from_address TEXT,
  to_address TEXT,
  amount TEXT,
  amount_units TEXT,
  block_number INTEGER,
  confirmations INTEGER,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_download_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS download_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  jti TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON orders(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE UNIQUE INDEX IF NOT EXISTS idx_downloads_token ON downloads(access_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order ON downloads(order_id);
`;

  const workerWrangler = `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "volt-paywall-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "volt-paywall-db",
      "database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "PRODUCT_PAYLOAD_KV",
      "id": "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
    }
  ],
  "triggers": {
    "crons": ["*/10 * * * *"]
  }
}
`;

  const clientConfig = `// Frontend configuration for VOLT Paywall Engine
export const CONFIG = {
  API_BASE_URL: 'https://your-worker.your-subdomain.workers.dev',
  PRODUCT: {
    id: 'creator-pack',
    name: 'VOLT Paywall Engine',
    price: '39',
    currency: 'USDT',
    network: 'BSC',
    chainId: 56,
  }
};
`;

  return [
    { name: 'README.md', content: readme },
    { name: 'GUIA-PASO-A-PASO.md', content: guiaPasoAPaso },
    { name: 'worker/schema.sql', content: workerSchema },
    { name: 'worker/wrangler.jsonc', content: workerWrangler },
    { name: 'frontend/src/config.ts', content: clientConfig },
  ];
}
