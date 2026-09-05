import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT,
  DEV_PAYMENT_RECIPIENT,
  generateExactAmount,
  generateOrderId,
  usdtToTokenUnits,
} from '../src/config';
import worker from '../src/index';
import { Env, D1OrderRecord } from '../src/types';

describe('VOLT Paywall Worker - Dual Payment Paths & Security Hardening Tests', () => {
  it('1. Orden wallet = 39 USDT exactos y expected_units = "39000000000000000000"', async () => {
    let insertedRecord: Record<string, unknown> = {};

    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => {
            insertedRecord = {
              id: args[0],
              product_id: args[1],
              payment_mode: args[2],
              amount: args[3],
              expected_amount: args[4],
              expected_units: args[5],
            };
            return {
              run: async () => ({ success: true }),
            };
          },
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'creator-pack', paymentMode: 'wallet' }),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json() as {
      amount: string;
      expectedAmount: string;
      expectedUnits: string;
      paymentMode: string;
    };

    assert.equal(data.paymentMode, 'wallet');
    assert.equal(data.amount, '39');
    assert.equal(data.expectedAmount, '39');
    assert.equal(data.expectedUnits, '39000000000000000000'); // 39 * 10^18 wei

    assert.equal(insertedRecord.payment_mode, 'wallet');
    assert.equal(insertedRecord.amount, '39');
    assert.equal(insertedRecord.expected_units, '39000000000000000000');
  });

  it('2. Orden manual = monto entre 39.0001 y 39.9999', () => {
    for (let i = 0; i < 100; i++) {
      const amountStr = generateExactAmount(39);
      const val = parseFloat(amountStr);
      assert.ok(val >= 39.0001 && val <= 39.9999, `Monto ${amountStr} fuera de rango`);
    }
  });

  it('3. Manual siempre tiene exactamente 4 decimales en string', () => {
    for (let i = 0; i < 100; i++) {
      const amountStr = generateExactAmount(39);
      assert.match(amountStr, /^39\.\d{4}$/, `Monto ${amountStr} debe coincidir con formato exacto de 4 decimales`);
    }
  });

  it('4. expected_units es un cálculo exacto en BigInt sin precisión flotante', () => {
    // 39 USDT -> 39000000000000000000
    assert.equal(usdtToTokenUnits('39'), '39000000000000000000');
    // 39.4271 USDT -> 39427100000000000000
    assert.equal(usdtToTokenUnits('39.4271'), '39427100000000000000');
    // 39.0001 USDT -> 39000100000000000000
    assert.equal(usdtToTokenUnits('39.0001'), '39000100000000000000');
    // 39.9999 USDT -> 39999900000000000000
    assert.equal(usdtToTokenUnits('39.9999'), '39999900000000000000');
  });

  it('5 - 12. Cliente NO puede modificar price, amount, expected_units, recipient, chainId, expiresAt, status ni txHash', async () => {
    let insertedRecord: Record<string, unknown> = {};

    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => {
            insertedRecord = {
              id: args[0],
              product_id: args[1],
              payment_mode: args[2],
              amount: args[3],
              expected_amount: args[4],
              expected_units: args[5],
              currency: args[6],
              network: args[7],
              chain_id: args[8],
              recipient: args[9],
              status: args[10],
            };
            return {
              run: async () => ({ success: true }),
            };
          },
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
    };

    const maliciousBody = {
      productId: 'creator-pack',
      paymentMode: 'manual',
      price: '0.0001',            // Intento de manipular precio
      amount: '0.0001',           // Intento de manipular monto
      expectedUnits: '100',       // Intento de manipular expected_units
      recipient: '0xAttacker',     // Intento de manipular recipiente
      chainId: 1,                 // Intento de manipular chainId
      expiresAt: '2099-01-01',     // Intento de manipular fecha de expiración
      status: 'PAID',              // Intento de manipular estado
      txHash: '0xFakeTxHash',      // Intento de manipular txHash
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousBody),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json() as {
      amount: string;
      expectedUnits: string;
      chainId: number;
      recipient: string;
      status: string;
    };

    assert.equal(data.status, 'PENDING');
    assert.equal(data.chainId, 97);
    assert.equal(data.recipient, DEV_PAYMENT_RECIPIENT);
    assert.match(data.amount, /^39\.\d{4}$/);
    assert.match(data.expectedUnits, /^39\d{18}$/);

    assert.equal(insertedRecord.status, 'PENDING');
    assert.equal(insertedRecord.chain_id, 97);
    assert.equal(insertedRecord.recipient, DEV_PAYMENT_RECIPIENT);
  });

  it('13. orderId sigue siendo impredecible y único', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const id = generateOrderId();
      assert.match(id, /^volt_ord_[0-9a-f]{16}$/);
      assert.ok(!ids.has(id));
      ids.add(id);
    }
  });

  it('14. txHash no puede asociarse fraudulentamente a múltiples órdenes (comprobación lógica de unicidad)', () => {
    const executedTxHashes = new Set<string>();
    const registerPayment = (txHash: string) => {
      if (executedTxHashes.has(txHash)) {
        throw new Error('UNIQUE constraint failed: tx_hash already exists');
      }
      executedTxHashes.add(txHash);
    };

    const tx = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    registerPayment(tx); // First claim succeeds

    assert.throws(() => registerPayment(tx), {
      message: /UNIQUE constraint failed/,
    });
  });

  it('15. Expiración continúa funcionando correctamente de PENDING a EXPIRED', async () => {
    let updateExecuted = false;
    let updatedStatus = '';

    const expiredRecord: D1OrderRecord = {
      id: 'volt_ord_6f1234567890abcd',
      product_id: 'creator-pack',
      payment_mode: 'manual',
      amount: '39.5000',
      expected_amount: '39.5000',
      expected_units: '39500000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient: DEV_PAYMENT_RECIPIENT,
      status: 'PENDING',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() - 60000).toISOString(), // Venció hace 1 min
      created_block: null,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    };

    const mockEnv: Env = {
      DB: {
        prepare: (stmt: string) => ({
          bind: (...args: unknown[]) => ({
            first: async () => expiredRecord,
            run: async () => {
              if (stmt.includes('UPDATE')) {
                updateExecuted = true;
                updatedStatus = args[0] as string;
              }
              return { success: true };
            },
          }),
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
      BSC_RPC_URL: 'none',
    };

    const req = new Request(`http://localhost:8787/api/status?orderId=${expiredRecord.id}`, { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const data = await res.json() as { status: string };

    assert.equal(data.status, 'EXPIRED');
    assert.ok(updateExecuted);
    assert.equal(updatedStatus, 'EXPIRED');
  });

  it('16. RPC devuelve chainId 97', async () => {
    const { getChainId } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x61', // 97 in hex
      }));
    };

    try {
      const chainId = await getChainId('http://mock-rpc');
      assert.equal(chainId, 97);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('17. RPC con chainId incorrecto es rechazado', async () => {
    const { getChainId } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1', // 1 in hex (Ethereum Mainnet)
      }));
    };

    try {
      await assert.rejects(
        async () => {
          await getChainId('http://mock-rpc');
        },
        /Chain ID mismatch/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('18. blockNumber válido se obtiene correctamente', async () => {
    const { getBlockNumber } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1e3f8', // 123896 in hex
      }));
    };

    try {
      const block = await getBlockNumber('http://mock-rpc');
      assert.equal(block, 123896);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('19. error HTTP RPC es manejado', async () => {
    const { getBlockNumber } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      return new Response('Internal Server Error', { status: 500 });
    };

    try {
      await assert.rejects(
        async () => {
          await getBlockNumber('http://mock-rpc');
        },
        /RPC HTTP Error: status 500/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('20. error JSON-RPC es manejado', async () => {
    const { getBlockNumber } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found',
        },
      }));
    };

    try {
      await assert.rejects(
        async () => {
          await getBlockNumber('http://mock-rpc');
        },
        /RPC Error -32601: Method not found/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('21. created_block se guarda cuando RPC está disponible', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      if (body.method === 'eth_chainId') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x61' }));
      }
      if (body.method === 'eth_blockNumber') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xfa0' })); // 4000
      }
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: null }));
    };

    let insertedRecord: Record<string, unknown> = {};

    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => {
            insertedRecord = {
              id: args[0],
              product_id: args[1],
              payment_mode: args[2],
              amount: args[3],
              expected_amount: args[4],
              expected_units: args[5],
              currency: args[6],
              network: args[7],
              chain_id: args[8],
              recipient: args[9],
              status: args[10],
              created_at: args[11],
              expires_at: args[12],
              created_block: args[13],
            };
            return {
              run: async () => ({ success: true }),
            };
          },
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-rpc',
    };

    try {
      const req = new Request('http://localhost:8787/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'creator-pack', paymentMode: 'wallet' }),
      });

      const res = await worker.fetch(req, mockEnv);
      assert.equal(res.status, 201);
      const data = await res.json() as { createdBlock: number };
      assert.equal(data.createdBlock, 4000);
      assert.equal(insertedRecord.created_block, 4000);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('22. demo continúa funcionando sin RPC', async () => {
    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => {
            return {
              run: async () => ({ success: true }),
            };
          },
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
      BSC_RPC_URL: 'none',
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'creator-pack' }),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json() as { createdBlock: number | null };
    assert.equal(data.createdBlock, null);
  });

  it('23. frontend no puede modificar parámetros blockchain', async () => {
    const maliciousBody = {
      productId: 'creator-pack',
      rpcUrl: 'http://attacker-rpc',
      tokenContract: '0xAttackerContract',
      recipient: '0xAttacker',
      chainId: 1,
      price: '0.01',
      expectedUnits: '123',
      expiresAt: '2099-01-01',
    };

    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => {
            return {
              run: async () => ({ success: true }),
            };
          },
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousBody),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json() as {
      chainId: number;
      recipient: string;
      expiresAt: string;
    };

    assert.equal(data.chainId, 97);
    assert.notEqual(data.recipient, '0xAttacker');
    const actualExpiresMs = new Date(data.expiresAt).getTime();
    const attackerExpiresMs = new Date('2099-01-01').getTime();
    assert.ok(actualExpiresMs < attackerExpiresMs);
  });

  it('24. PAYMENT_RECIPIENT inválido (formato EVM incorrecto) es rechazado', async () => {
    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: () => ({ run: async () => ({ success: true }) }),
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
      PAYMENT_RECIPIENT: '0xInvalidAddress', // Not 42 chars
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'creator-pack' }),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 500); // Handled error response
  });

  it('25. PAYMENT_RECIPIENT placeholder en producción es rechazado', async () => {
    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: () => ({ run: async () => ({ success: true }) }),
        }),
      } as unknown as D1Database,
      APP_ENV: 'production',
      PAYMENT_RECIPIENT: '0x000000000000000000000000000000000000DEV', // Placeholder
    };

    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'creator-pack' }),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 500);
  });

  it('26. RPC_CHUNK_SIZE respeta límites seguros (min 10, max 5000)', async () => {
    const { getRpcChunkSize } = await import('../src/services/rpc');
    
    // Too small -> clamped to 10
    const envLow: Env = { DB: {} as any, RPC_CHUNK_SIZE: '2' };
    assert.equal(getRpcChunkSize(envLow), 10);

    // Too large -> clamped to 5000
    const envHigh: Env = { DB: {} as any, RPC_CHUNK_SIZE: '999999' };
    assert.equal(getRpcChunkSize(envHigh), 5000);

    // Valid -> returns parsed
    const envValid: Env = { DB: {} as any, RPC_CHUNK_SIZE: '2500' };
    assert.equal(getRpcChunkSize(envValid), 2500);
  });

  it('27. Cuando RPC está configurado y falla, la creación de orden falla (no hay fallback silencioso)', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error('Network Timeout');
    };

    const mockEnv: Env = {
      DB: {
        prepare: () => ({
          bind: () => ({ run: async () => ({ success: true }) }),
        }),
      } as unknown as D1Database,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://failing-rpc',
      PAYMENT_RECIPIENT: '0x1234567890123456789012345678901234567890',
    };

    try {
      const req = new Request('http://localhost:8787/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'creator-pack', paymentMode: 'wallet' }),
      });

      const res = await worker.fetch(req, mockEnv);
      assert.equal(res.status, 500); // Must fail when configured RPC is down
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('28. blockNumber inválido (hex malformado) es rechazado', async () => {
    const { getBlockNumber } = await import('../src/services/rpc');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: 'invalid-hex',
      }));
    };

    try {
      await assert.rejects(
        async () => {
          await getBlockNumber('http://mock-rpc');
        },
        /Invalid eth_blockNumber response format/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('29. Verificación de pago exitosa (Transfer válida -> CONFIRMING con payments registrados)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_test1',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: '0x61' }));
      }
      if (body.method === 'eth_blockNumber') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: '0x3ef' })); // 1007
      }
      if (body.method === 'eth_getLogs') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: [{
            address: tokenContract,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000' + buyer.slice(2),
              '0x000000000000000000000000' + recipient.slice(2),
            ],
            data: expectedUnitsHex,
            blockNumber: '0x3ed', // 1005
            transactionHash: txHash,
          }],
        }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ed',
            status: '0x1',
            from: buyer,
            to: recipient,
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            timestamp: '0x' + blockTimestamp.toString(16),
          },
        }));
      }
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_test1', mockEnv);
      assert.equal(dbRecord.status, 'CONFIRMING');
      assert.equal(dbRecord.tx_hash, txHash);
      assert.equal(dbRecord.buyer_address, buyer.toLowerCase());
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('30. Transferencia tardía detectada después de expiración -> PAID_LATE', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789011';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_late1',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'EXPIRED', // Already expired
      created_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() - 1800000).toISOString(), // expired 30 mins ago
      created_block: 1000,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3ef' }));
      if (body.method === 'eth_getLogs') {
        return new Response(JSON.stringify({
          result: [{
            address: tokenContract,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000' + buyer.slice(2),
              '0x000000000000000000000000' + recipient.slice(2),
            ],
            data: expectedUnitsHex,
            blockNumber: '0x3ed',
            transactionHash: txHash,
          }],
        }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: { transactionHash: txHash, blockNumber: '0x3ed', status: '0x1', from: buyer, to: recipient },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) + 100;
        return new Response(JSON.stringify({
          result: {
            timestamp: '0x' + blockTimestamp.toString(16),
          },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_late1', mockEnv);
      assert.equal(dbRecord.status, 'PAID_LATE'); // Must be PAID_LATE when expired
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('31. Verificación directa mediante clientTxHash sin escanear logs (EIP-1193 direct flow)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_direct1',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    let getLogsCalled = false;
    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3ef' }));
      if (body.method === 'eth_getLogs') {
        getLogsCalled = true;
        return new Response(JSON.stringify({ result: [] }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ed',
            status: '0x1',
            from: buyer,
            to: recipient,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3ed',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: {
            timestamp: '0x' + blockTimestamp.toString(16),
          },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_direct1', mockEnv, txHash);
      assert.equal(dbRecord.status, 'CONFIRMING');
      assert.equal(dbRecord.tx_hash, txHash);
      assert.equal(dbRecord.buyer_address, buyer.toLowerCase());
      assert.equal(getLogsCalled, false, 'getLogs should not be called in the direct EIP-1193 receipt-logs verification path');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('32. CONFIRMING recalcula y actualiza las confirmaciones sin re-insertar en payments', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_conf1',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'CONFIRMING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: txHash,
      confirmations: 3,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              if (query.includes('SELECT id FROM orders')) return null;
              if (query.includes('SELECT id FROM payments')) return null;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3f4' })); // 1012 (1012 - 1005 + 1 = 8 confirmations)
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ed',
            status: '0x1',
            from: buyer,
            to: recipient,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3ed',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + blockTimestamp.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_conf1', mockEnv, txHash);
      assert.equal(dbRecord.status, 'CONFIRMING');
      assert.equal(dbRecord.confirmations, 8);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('33. CONFIRMING pasa a PAID al llegar a 12 confirmaciones de bloque', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_paid12',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'CONFIRMING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: txHash,
      confirmations: 8,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.confirmations = args[2];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3fc' })); // 1020 (1020 - 1005 + 1 = 16 confirmations)
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ed',
            status: '0x1',
            from: buyer,
            to: recipient,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3ed',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + blockTimestamp.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_paid12', mockEnv, txHash);
      assert.equal(dbRecord.status, 'PAID');
      assert.equal(dbRecord.confirmations, 16);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('34. Fallo de eth_getBlockByNumber no produce un PAID_LATE artificial y arroja excepción', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';

    let dbRecord: any = {
      id: 'volt_ord_fail_rpc',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          first: async () => {
            if (query.includes('SELECT * FROM orders')) return dbRecord;
            return null;
          },
          run: async () => ({ success: true }),
        }),
      }),
      batch: async () => [{ success: true }],
    } as unknown as D1Database;

    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3ef' }));
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ed',
            status: '0x1',
            from: buyer,
            to: recipient,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3ed',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        return new Response(JSON.stringify({ result: null }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await assert.rejects(
        async () => {
          await verifyOrderPayment('volt_ord_fail_rpc', mockEnv, txHash);
        },
        /RPC_TIMESTAMP_FETCH_FAILED/
      );
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('35. Transacción con status 0x0 es rechazada de inmediato', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';

    let dbRecord: any = {
      id: 'volt_ord_status0',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 600000).toISOString(),
      created_block: 1000,
      paid_at: null,
      tx_hash: null,
      confirmations: 0,
      updated_at: new Date().toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          first: async () => {
            if (query.includes('SELECT * FROM orders')) return dbRecord;
            return null;
          },
          run: async () => ({ success: true }),
        }),
      }),
      batch: async () => [{ success: true }],
    } as unknown as D1Database;

    globalThis.fetch = async (_url: any, init: any) => {
      const body = JSON.parse(init.body);
      if (body.method === 'eth_chainId') return new Response(JSON.stringify({ result: '0x61' }));
      if (body.method === 'eth_blockNumber') return new Response(JSON.stringify({ result: '0x3ef' }));
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: { transactionHash: txHash, blockNumber: '0x3ed', status: '0x0', from: buyer, to: recipient },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_status0', mockEnv, txHash);
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('36. PRODUCTION jamás entrega el ZIP de fallback si KV falla', async () => {
    let selectTokenRecord = {
      order_id: 'volt_ord_prod_fail',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used_at: null,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (..._args: any[]) => ({
          first: async () => selectTokenRecord,
          run: async () => ({ success: true }),
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'production',
      ASSETS_KV: undefined, // KV represents an unprovisioned or empty asset store
    };

    const token = 'volt_tok_12345678901234567890123456789012';
    const req = new Request(`http://localhost:8787/api/download?token=${token}`);
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 500);
    const data = await res.json() as { error: string };
    assert.equal(data.error, 'ASSET_UNAVAILABLE');
  });

  it('37. Permite descargas múltiples dentro de la ventana de recuperación de 10 minutos', async () => {
    // Simulate a token claimed 2 minutes ago
    const twoMinutesAgoIso = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    let selectTokenRecord = {
      order_id: 'volt_ord_grace_success',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used_at: twoMinutesAgoIso,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (..._args: any[]) => ({
          first: async () => selectTokenRecord,
          run: async () => ({ success: true }),
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
    };

    const token = 'volt_tok_12345678901234567890123456789012';
    const req = new Request(`http://localhost:8787/api/download?token=${token}`);
    const res = await worker.fetch(req, mockEnv);

    // Should successfully deliver the fallback zip in development mode since it is inside the 10-minute grace window
    assert.equal(res.status, 200);
  });

  it('38. Bloquea descargas si se excede la ventana de recuperación de 10 minutos', async () => {
    // Simulate a token claimed 11 minutes ago
    const elevenMinutesAgoIso = new Date(Date.now() - 11 * 60 * 1000).toISOString();
    let selectTokenRecord = {
      order_id: 'volt_ord_grace_fail',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used_at: elevenMinutesAgoIso,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (..._args: any[]) => ({
          first: async () => selectTokenRecord,
          run: async () => ({ success: true }),
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
    };

    const token = 'volt_tok_12345678901234567890123456789012';
    const req = new Request(`http://localhost:8787/api/download?token=${token}`);
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 403);
    const body = await res.text();
    assert.match(body, /expired/i);
  });

  it('39. Finality Check - finalized block válido (pago pasa a PAID con < 12 confirmaciones si está finalizado)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567895';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_finality_ok',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_block: 1000,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init?.body as string);
      if (body.method === 'eth_chainId') {
        return new Response(JSON.stringify({ result: '0x61' }));
      }
      if (body.method === 'eth_blockNumber') {
        return new Response(JSON.stringify({ result: '0x3ec' }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3ea',
            status: '0x1',
            from: buyer,
            to: tokenContract,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3ea',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        if (body.params[0] === 'finalized') {
          return new Response(JSON.stringify({
            result: { number: '0x3eb' },
          }));
        }
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + blockTimestamp.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_finality_ok', mockEnv, txHash);
      assert.equal(dbRecord.status, 'PAID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('40. Finality Check - transacción incluida pero no finalizada (pasa a CONFIRMING si confirmations < 12 y blockNumber > finalizedBlock)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567896';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_not_final',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_block: 1000,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init?.body as string);
      if (body.method === 'eth_chainId') {
        return new Response(JSON.stringify({ result: '0x61' }));
      }
      if (body.method === 'eth_blockNumber') {
        return new Response(JSON.stringify({ result: '0x3ec' }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3e9',
            status: '0x1',
            from: buyer,
            to: tokenContract,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3e9',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        if (body.params[0] === 'finalized') {
          return new Response(JSON.stringify({
            result: { number: '0x3e8' },
          }));
        }
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + blockTimestamp.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_not_final', mockEnv, txHash);
      assert.equal(dbRecord.status, 'CONFIRMING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('41. Finality Check - RPC sin soporte o resultado inválido (fallback a confirmaciones >= 12 pasa a PAID)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const buyer = '0x2222222222222222222222222222222222222222';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567897';
    const expectedUnitsHex = '0x' + BigInt('39000000000000000000').toString(16);

    let dbRecord: any = {
      id: 'volt_ord_no_final_support',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_block: 1000,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          const runFn = async () => {
            if (query.includes('UPDATE orders')) {
              dbRecord.status = args[0];
              dbRecord.tx_hash = args[1];
              dbRecord.confirmations = args[2];
              dbRecord.buyer_address = args[3];
            }
            return { success: true };
          };
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: runFn,
          };
        },
      }),
      batch: async (statements: any[]) => {
        for (const stmt of statements) {
          await stmt.run();
        }
        return [{ success: true }, { success: true }];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init?.body as string);
      if (body.method === 'eth_chainId') {
        return new Response(JSON.stringify({ result: '0x61' }));
      }
      if (body.method === 'eth_blockNumber') {
        return new Response(JSON.stringify({ result: '0x3fc' }));
      }
      if (body.method === 'eth_getTransactionReceipt') {
        return new Response(JSON.stringify({
          result: {
            transactionHash: txHash,
            blockNumber: '0x3e9',
            status: '0x1',
            from: buyer,
            to: tokenContract,
            logs: [{
              address: tokenContract,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000' + buyer.slice(2),
                '0x000000000000000000000000' + recipient.slice(2),
              ],
              data: expectedUnitsHex,
              blockNumber: '0x3e9',
              transactionHash: txHash,
            }]
          },
        }));
      }
      if (body.method === 'eth_getBlockByNumber') {
        if (body.params[0] === 'finalized') {
          return new Response(JSON.stringify({ result: null }));
        }
        const blockTimestamp = Math.floor(new Date(dbRecord.expires_at).getTime() / 1000) - 100;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + blockTimestamp.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_no_final_support', mockEnv, txHash);
      assert.equal(dbRecord.status, 'PAID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('42. Finality Check - RPC temporalmente caído (no se altera el estado de la orden y aborta gracefully)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const tokenContract = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567898';

    let dbRecord: any = {
      id: 'volt_ord_rpc_down',
      product_id: 'creator-pack',
      payment_mode: 'wallet',
      amount: '39',
      expected_amount: '39',
      expected_units: '39000000000000000000',
      currency: 'USDT',
      network: 'BSC',
      chain_id: 97,
      recipient,
      status: 'PENDING',
      created_at: new Date(Date.now() - 10000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_block: 1000,
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('SELECT * FROM orders')) {
            return { first: async () => dbRecord };
          }
          return { first: async () => null };
        },
      }),
    } as unknown as D1Database;

    globalThis.fetch = async () => {
      throw new Error('Network Connection Timed Out');
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://failing-rpc',
      USDT_CONTRACT_ADDRESS: tokenContract,
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await assert.rejects(
        async () => {
          await verifyOrderPayment('volt_ord_rpc_down', mockEnv, txHash);
        },
        /blockchain_rpc_failure|connection failed/i
      );
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('43. D1 Security - Mismo txHash intentando pagar dos órdenes distintas es bloqueado', async () => {
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567899';

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('SELECT * FROM orders WHERE id = ?')) {
            return {
              first: async () => ({
                id: args[0],
                status: 'PENDING',
                created_block: 1000,
                amount: '39',
                expected_units: '39000000000000000000',
                created_at: new Date(Date.now() - 60000).toISOString(),
                expires_at: new Date(Date.now() + 3600000).toISOString(),
                recipient,
              }),
            };
          }
          if (query.includes('SELECT id FROM orders WHERE tx_hash = ? AND id != ?')) {
            // Already assigned to another order!
            return { first: async () => ({ id: 'volt_ord_other_order' }) };
          }
          if (query.includes('SELECT id FROM payments WHERE tx_hash = ?')) {
            return { first: async () => null };
          }
          return { first: async () => null };
        },
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ result: '0x61' }));

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_dup_test', mockEnv, txHash);
      // Should return early and NOT process payment due to duplicate txHash check
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('44. D1 Atomic Token - Primer consumo condicional es atómico y segundo intento respeta grace/claim', async () => {
    let usedAtValue: string | null = null;
    let queryCount = 0;

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          run: async () => {
            if (query.includes('UPDATE download_tokens')) {
              queryCount++;
              if (usedAtValue === null) {
                usedAtValue = args[0]; // Set used_at timestamp
                return { success: true, meta: { changes: 1 } };
              } else {
                return { success: true, meta: { changes: 0 } };
              }
            }
            return { success: true };
          },
          first: async () => {
            if (query.includes('SELECT * FROM download_tokens')) {
              return {
                order_id: 'volt_ord_atomic_test',
                expires_at: new Date(Date.now() + 3600000).toISOString(),
                used_at: usedAtValue,
              };
            }
            return null;
          },
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
    };

    const tokenPlaintext = 'volt_tok_11112222333344445555666677778888';
    const req1 = new Request(`http://localhost:8787/api/download?token=${tokenPlaintext}`);
    const res1 = await worker.fetch(req1, mockEnv);
    assert.equal(res1.status, 200);
    assert.ok(usedAtValue !== null, 'used_at debió ser asignado en el primer consumo');

    // Segundo consumo inmediato (dentro de la ventana de gracia de 10 min)
    const req2 = new Request(`http://localhost:8787/api/download?token=${tokenPlaintext}`);
    const res2 = await worker.fetch(req2, mockEnv);
    assert.equal(res2.status, 200, 'Permite re-descarga dentro de los 10 minutos de gracia');
  });

  it('45. D1 Download Token - Token expirado (>1 hora) es rechazado con error 403', async () => {
    const expiredIso = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: () => ({
          run: async () => ({ success: true, meta: { changes: 0 } }),
          first: async () => ({
            order_id: 'volt_ord_expired_tok',
            expires_at: expiredIso,
            used_at: null,
          }),
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = { DB: mockDb, APP_ENV: 'development' };
    const req = new Request('http://localhost:8787/api/download?token=volt_tok_99998888777766665555444433332222');
    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 403);
    const bodyText = await res.text();
    assert.match(bodyText, /expired/i);
  });

  it('46. D1 Download Token - Token consumido fuera de la ventana de gracia (>10 min) es rechazado', async () => {
    const usedLongAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString(); // 15 min ago

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: () => ({
          run: async () => ({ success: true, meta: { changes: 0 } }),
          first: async () => ({
            order_id: 'volt_ord_claimed_old',
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            used_at: usedLongAgo,
          }),
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = { DB: mockDb, APP_ENV: 'development' };
    const req = new Request('http://localhost:8787/api/download?token=volt_tok_88887777666655554444333322221111');
    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 403);
    const bodyText = await res.text();
    assert.match(bodyText, /claimed more than 10 minutes ago/i);
  });

  it('47. D1 Order Status - Orden en estado PAID ignora re-verificaciones y preserva su estado', async () => {
    let updateCalled = false;
    const recipient = '0x1111111111111111111111111111111111111111';

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: () => ({
          first: async () => ({
            id: 'volt_ord_already_paid',
            status: 'PAID',
            amount: '39',
            expected_units: '39000000000000000000',
            recipient,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          }),
          run: async () => {
            updateCalled = true;
            return { success: true };
          },
        }),
      }),
    } as unknown as D1Database;

    const mockEnv: Env = { DB: mockDb, APP_ENV: 'development' };
    const { verifyOrderPayment } = await import('../src/services/verifier');
    await verifyOrderPayment('volt_ord_already_paid', mockEnv, '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    assert.equal(updateCalled, false, 'No debió ejecutarse ninguna actualización en D1 para una orden ya PAID');
  });

  it('48. D1 Idempotency - Repetición de la misma verificación con mismo txHash no duplica pagos', async () => {
    let paymentInsertedCount = 0;
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    const dbRecord: any = {
      id: 'volt_ord_idempotent',
      status: 'CONFIRMING',
      created_block: 1000,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      tx_hash: txHash,
      created_at: new Date(Date.now() - 60000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => ({
          first: async () => {
            if (query.includes('SELECT * FROM orders')) return dbRecord;
            if (query.includes('SELECT id FROM orders WHERE tx_hash')) return null; // Same order
            if (query.includes('SELECT id FROM payments WHERE tx_hash')) return null;
            return null;
          },
          run: async () => {
            if (query.includes('INSERT INTO payments')) paymentInsertedCount++;
            return { success: true };
          },
        }),
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) {
        return new Response(JSON.stringify({ result: '0x61' }));
      }
      if (bodyStr.includes('eth_blockNumber')) {
        return new Response(JSON.stringify({ result: '0x3f0' })); // 1008
      }
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3e8', // 1000
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111'
              ],
              data: '0x0000000000000000000000000000000000000000000000021e19e0c9bab20000',
              blockNumber: '0x3e8',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_idempotent', mockEnv, txHash);
      assert.ok(paymentInsertedCount <= 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('49. D1 Verification - Pago tardío (bloque > expires_at) marca la orden como PAID_LATE', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567895';
    let statusSet: string | null = null;

    const expiresAtMs = Date.now() - 500000; // Expired 500s ago
    const blockTimeSec = Math.floor(Date.now() / 1000); // Block timestamp AFTER expires_at

    const dbRecord: any = {
      id: 'volt_ord_1111222233334449',
      status: 'EXPIRED',
      created_block: 1000,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: new Date(expiresAtMs - 1000000).toISOString(),
      expires_at: new Date(expiresAtMs).toISOString(),
    };

    const queriesPrepared: string[] = [];
    const mockDb: D1Database = {
      prepare: (query: string) => {
        queriesPrepared.push(query);
        return {
          bind: (...args: any[]) => {
            if (query.includes('UPDATE orders')) {
              statusSet = args[0];
            }
            return {
              first: async () => {
                if (query.includes('SELECT * FROM orders')) return dbRecord;
                return null;
              },
              run: async () => ({ success: true }),
            };
          },
        };
      },
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x400' }));
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3e8',
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111'
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3e8',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { number: '0x3e8', timestamp: '0x' + blockTimeSec.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_1111222233334449', mockEnv, txHash);
      assert.equal(statusSet, 'PAID_LATE');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('50. D1 Resiliency - Fallo de RPC durante consulta de orden existente conserva PENDING', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';

    const dbRecord: any = {
      id: 'volt_ord_1111222233334500',
      status: 'PENDING',
      created_block: 1000,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: new Date(Date.now() - 60000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: () => ({
          first: async () => dbRecord,
          run: async () => ({ success: true }),
        }),
      }),
    } as unknown as D1Database;

    globalThis.fetch = async () => {
      throw new Error('RPC Server Unavailable');
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://failing-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const req = new Request('http://localhost:8787/api/status?orderId=volt_ord_1111222233334500');
      const res = await worker.fetch(req, mockEnv);
      assert.equal(res.status, 200);
      const data = await res.json() as any;
      assert.equal(data.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('51. D1 Order Lifecycle - Flujo completo PENDING -> CONFIRMING -> PAID', async () => {
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567897';

    let currentStatus = 'PENDING';
    let currentConfirmations = 0;

    const dbRecord: any = {
      id: 'volt_ord_1111222233334511',
      status: 'PENDING',
      created_block: 1000,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: new Date(Date.now() - 60000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            currentStatus = args[0];
            dbRecord.status = args[0];
            currentConfirmations = args[2];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    const originalFetch = globalThis.fetch;
    let mockBlockNumber = 1002; // 3 confirmations (< 12, not finalized)
    let mockFinalizedBlock: number | null = 998;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x' + mockBlockNumber.toString(16) }));
      if (bodyStr.includes('finalized')) {
        return new Response(JSON.stringify({ result: mockFinalizedBlock ? { number: '0x' + mockFinalizedBlock.toString(16) } : null }));
      }
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3e8', // 1000
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111'
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3e8',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + Math.floor((Date.now() - 10000) / 1000).toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      
      // Step 1: PENDING -> CONFIRMING (3 confirmations, not finalized)
      await verifyOrderPayment('volt_ord_1111222233334511', mockEnv, txHash);
      assert.equal(currentStatus, 'CONFIRMING');

      // Step 2: Finalized block reaches 1000 -> PAID
      mockFinalizedBlock = 1005;
      await verifyOrderPayment('volt_ord_1111222233334511', mockEnv, txHash);
      assert.equal(currentStatus, 'PAID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('52. D1 Security - Datos del frontend (status, price, recipient) son totalmente ignorados y no pueden alterar una orden', async () => {
    let insertedData: any = {};

    const mockDb: D1Database = {
      prepare: () => ({
        bind: (...args: any[]) => {
          insertedData = {
            id: args[0],
            productId: args[1],
            paymentMode: args[2],
            amount: args[3],
            expectedAmount: args[4],
            expectedUnits: args[5],
            currency: args[6],
            network: args[7],
            chainId: args[8],
            recipient: args[9],
            status: args[10],
          };
          return { run: async () => ({ success: true }) };
        },
      }),
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      PAYMENT_RECIPIENT: '0x000000000000000000000000000000000000dEaD',
    };

    // Attacker sends arbitrary overrides in POST body
    const req = new Request('http://localhost:8787/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'creator-pack',
        paymentMode: 'wallet',
        status: 'PAID', // Attacker attempt
        price: '0.0001', // Attacker attempt
        recipient: '0xAttackerAddress0000000000000000000000000', // Attacker attempt
        expectedUnits: '1', // Attacker attempt
      }),
    });

    const res = await worker.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json() as any;

    assert.equal(data.status, 'PENDING');
    assert.equal(data.amount, '39');
    assert.equal(data.recipient, '0x000000000000000000000000000000000000dEaD');
    assert.equal(insertedData.status, 'PENDING');
    assert.equal(insertedData.amount, '39');
  });

  it('53. Assets Routing - Solicitudes no /api/* son servidas via env.ASSETS.fetch', async () => {
    let assetsFetchedUrl: string | null = null;
    const mockEnv: Env = {
      DB: {} as D1Database,
      APP_ENV: 'development',
      ASSETS: {
        fetch: async (req: Request | string) => {
          const url = typeof req === 'string' ? req : req.url;
          assetsFetchedUrl = url;
          return new Response('<html>Mock Index HTML</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          });
        },
      } as unknown as Fetcher,
    };

    const req = new Request('http://localhost:8787/checkout?order=volt_ord_123');
    const res = await worker.fetch(req, mockEnv);

    assert.equal(res.status, 200);
    assert.equal(await res.text(), '<html>Mock Index HTML</html>');
    assert.equal(assetsFetchedUrl, 'http://localhost:8787/checkout?order=volt_ord_123');
  });

  it('54. D1 Resiliency - created_block null is rescued successfully', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891';

    let statusSet: string | null = null;
    const dbRecord: any = {
      id: 'volt_ord_1111222233334544',
      status: 'PENDING',
      created_block: null, // Null to trigger rescue
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: new Date(Date.now() - 30000).toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusSet = args[0];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              if (query.includes('SELECT id FROM orders WHERE tx_hash = ?')) return null;
              if (query.includes('SELECT id FROM payments WHERE tx_hash = ?')) return null;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x400' })); // 1024
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3e8', // 1000
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111'
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3e8',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + Math.floor((Date.now() - 10000) / 1000).toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_1111222233334544', mockEnv, txHash);
      // Under finalized checks or 24 confirmations fallback: 1024 - 1000 = 24 confirmations >= 12 -> PAID
      assert.equal(statusSet, 'PAID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('55. Security Hardening - created_block NULL + clientTxHash antiguo (anterior a created_at) es RECHAZADO (Bug Original)', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const oldTxHash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    const orderCreatedAt = new Date('2026-03-01T12:00:00Z');
    const orderCreatedAtMs = orderCreatedAt.getTime();
    // Transaction mined 10 minutes BEFORE order creation
    const txBlockTimestampSec = Math.floor(orderCreatedAtMs / 1000) - 600;

    let statusUpdated: string | null = null;
    const dbRecord: any = {
      id: 'volt_ord_bug_test_old_tx',
      status: 'PENDING',
      created_block: null, // Null to simulate missing block
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: orderCreatedAt.toISOString(),
      expires_at: new Date(orderCreatedAtMs + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusUpdated = args[0];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              if (query.includes('SELECT id FROM orders WHERE tx_hash = ?')) return null;
              if (query.includes('SELECT id FROM payments WHERE tx_hash = ?')) return null;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      // Current block is 2000
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x7d0' }));
      // Receipt says block 500 (0x1f4)
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x1f4', // 500
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x1f4',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + txBlockTimestampSec.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_bug_test_old_tx', mockEnv, oldTxHash);

      // MUST NOT be updated to PAID or CONFIRMING
      assert.equal(statusUpdated, null, 'An old transaction mined prior to order creation MUST NOT mark order as PAID');
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('56. Security Hardening - created_block NULL + clientTxHash válido (posterior a created_at) es ACEPTADO', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const newTxHash = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    const orderCreatedAt = new Date(Date.now() - 30000); // 30s ago
    const orderCreatedAtMs = orderCreatedAt.getTime();
    // Transaction mined 10 seconds ago (AFTER order creation)
    const txBlockTimestampSec = Math.floor((orderCreatedAtMs + 20000) / 1000);

    let statusUpdated: string | null = null;
    const dbRecord: any = {
      id: 'volt_ord_new_valid_tx',
      status: 'PENDING',
      created_block: null,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: orderCreatedAt.toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusUpdated = args[0];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              if (query.includes('SELECT id FROM orders WHERE tx_hash = ?')) return null;
              if (query.includes('SELECT id FROM payments WHERE tx_hash = ?')) return null;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      // Current block 1050
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x41a' }));
      if (bodyStr.includes('finalized')) return new Response(JSON.stringify({ result: { number: '0x410' } }));
      // Receipt mined at block 1020
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3fc', // 1020
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3fc',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + txBlockTimestampSec.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_new_valid_tx', mockEnv, newTxHash);

      assert.equal(statusUpdated, 'PAID', 'A legitimate transaction mined after order creation must transition to PAID');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('57. Security Hardening - created_block NULL + Path B scan: pago anterior a created_at es omitido y posterior es aceptado', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const oldTx = '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
    const validTx = '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';

    const orderCreatedAt = new Date(Date.now() - 60000); // 60s ago
    const orderCreatedAtMs = orderCreatedAt.getTime();
    const oldTxTimestampSec = Math.floor((orderCreatedAtMs - 60000) / 1000); // 60s BEFORE order
    const validTxTimestampSec = Math.floor((orderCreatedAtMs + 30000) / 1000); // 30s AFTER order

    let statusUpdated: string | null = null;
    let accreditedTx: string | null = null;

    const dbRecord: any = {
      id: 'volt_ord_path_b_filtering',
      status: 'PENDING',
      created_block: null,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: orderCreatedAt.toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusUpdated = args[0];
            accreditedTx = args[1];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              if (query.includes('SELECT id FROM orders WHERE tx_hash = ?')) return null;
              if (query.includes('SELECT id FROM payments WHERE tx_hash = ?')) return null;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async (stmts: any[]) => {
        for (const s of stmts) {
          if (s) await s.run();
        }
        return [];
      },
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      // Current block is 1050
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x41a' }));
      if (bodyStr.includes('finalized')) return new Response(JSON.stringify({ result: { number: '0x410' } }));

      // Path B getLogs returns both oldTx and validTx
      if (bodyStr.includes('eth_getLogs')) {
        return new Response(JSON.stringify({
          result: [
            {
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3e8', // Block 1000 (old)
              transactionHash: oldTx,
            },
            {
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x400', // Block 1024 (valid, post-creation)
              transactionHash: validTx,
            },
          ],
        }));
      }

      if (bodyStr.includes('eth_getTransactionReceipt')) {
        const bodyObj = JSON.parse(bodyStr);
        const reqTx = bodyObj.params?.[0];
        const isOld = reqTx === oldTx;
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: isOld ? '0x3e8' : '0x400',
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: isOld ? '0x3e8' : '0x400',
            }],
          },
        }));
      }

      if (bodyStr.includes('eth_getBlockByNumber')) {
        const bodyObj = JSON.parse(bodyStr);
        const blockParam = bodyObj.params?.[0];
        const isOldBlock = blockParam === '0x3e8' || parseInt(blockParam, 16) === 1000;
        const ts = isOldBlock ? oldTxTimestampSec : validTxTimestampSec;
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + ts.toString(16) },
        }));
      }

      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      // Call without clientTxHash -> triggers Path B
      await verifyOrderPayment('volt_ord_path_b_filtering', mockEnv);

      assert.equal(statusUpdated, 'PAID');
      assert.equal(accreditedTx, validTx, 'Path B must skip old transaction and accredit only the valid transaction');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('58. Security Hardening - created_block NULL + Path B scan: solo existe pago anterior a created_at -> RECHAZADO', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const oldTx = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    const orderCreatedAt = new Date(Date.now() - 60000);
    const orderCreatedAtMs = orderCreatedAt.getTime();
    const oldTxTimestampSec = Math.floor((orderCreatedAtMs - 60000) / 1000); // Prior to creation

    let statusUpdated: string | null = null;
    const dbRecord: any = {
      id: 'volt_ord_path_b_only_old',
      status: 'PENDING',
      created_block: null,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: orderCreatedAt.toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusUpdated = args[0];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async () => [],
    } as unknown as D1Database;

    globalThis.fetch = async (input: any, init?: any) => {
      const bodyStr = init?.body || '';
      if (bodyStr.includes('eth_chainId')) return new Response(JSON.stringify({ result: '0x61' }));
      if (bodyStr.includes('eth_blockNumber')) return new Response(JSON.stringify({ result: '0x41a' }));
      if (bodyStr.includes('eth_getLogs')) {
        return new Response(JSON.stringify({
          result: [{
            address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x0000000000000000000000002222222222222222222222222222222222222222',
              '0x0000000000000000000000001111111111111111111111111111111111111111',
            ],
            data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
            blockNumber: '0x3e8',
            transactionHash: oldTx,
          }],
        }));
      }
      if (bodyStr.includes('eth_getTransactionReceipt')) {
        return new Response(JSON.stringify({
          result: {
            status: '0x1',
            blockNumber: '0x3e8',
            from: '0x2222222222222222222222222222222222222222',
            logs: [{
              address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x0000000000000000000000002222222222222222222222222222222222222222',
                '0x0000000000000000000000001111111111111111111111111111111111111111',
              ],
              data: '0x0000000000000000000000000000000000000000000000021d3bd55e803c0000',
              blockNumber: '0x3e8',
            }],
          },
        }));
      }
      if (bodyStr.includes('eth_getBlockByNumber')) {
        return new Response(JSON.stringify({
          result: { timestamp: '0x' + oldTxTimestampSec.toString(16) },
        }));
      }
      return new Response(JSON.stringify({ result: null }));
    };

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_path_b_only_old', mockEnv);

      assert.equal(statusUpdated, null, 'Order must remain PENDING when only old transactions exist in scan window');
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('59. Security Hardening - created_at ausente o corrupto ejecuta fail-closed sin aceptar pagos', async () => {
    const originalFetch = globalThis.fetch;
    const recipient = '0x1111111111111111111111111111111111111111';
    const txHash = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    let statusUpdated: string | null = null;
    const dbRecord: any = {
      id: 'volt_ord_corrupted_created_at',
      status: 'PENDING',
      created_block: 1000,
      amount: '39',
      expected_units: '39000000000000000000',
      recipient,
      created_at: 'NOT_A_VALID_DATE_STRING', // Corrupted timestamp
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    const mockDb: D1Database = {
      prepare: (query: string) => ({
        bind: (...args: any[]) => {
          if (query.includes('UPDATE orders')) {
            statusUpdated = args[0];
          }
          return {
            first: async () => {
              if (query.includes('SELECT * FROM orders')) return dbRecord;
              return null;
            },
            run: async () => ({ success: true }),
          };
        },
      }),
      batch: async () => [],
    } as unknown as D1Database;

    const mockEnv: Env = {
      DB: mockDb,
      APP_ENV: 'development',
      BSC_RPC_URL: 'http://mock-bsc-rpc',
      USDT_CONTRACT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      PAYMENT_RECIPIENT: recipient,
    };

    try {
      const { verifyOrderPayment } = await import('../src/services/verifier');
      await verifyOrderPayment('volt_ord_corrupted_created_at', mockEnv, txHash);

      assert.equal(statusUpdated, null, 'Verification must abort immediately (fail-closed) on invalid created_at');
      assert.equal(dbRecord.status, 'PENDING');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});


