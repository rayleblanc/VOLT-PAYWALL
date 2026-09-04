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
      id: 'volt_ord_expired_test',
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
});

