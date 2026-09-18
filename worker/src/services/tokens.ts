// VOLT Paywall Worker - Cryptographic Token Service (HMAC-SHA256)
// Uses native Web Crypto API (supported natively in Cloudflare Workers and Node 18+)

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface DownloadTokenPayload {
  orderId: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Signs and generates a secure, opaque download token using HMAC-SHA256.
 * Mandatory: requires non-empty secret (JWT_SECRET).
 */
export async function signDownloadToken(
  orderId: string,
  secret: string,
  ttlSeconds: number = 3600 // 1 hour expiration
): Promise<{ token: string; jti: string; expiresAtIso: string; createdAtIso: string }> {
  if (!secret || secret.trim().length === 0) {
    throw new Error('JWT_SECRET_REQUIRED: JWT_SECRET signature key is mandatory to issue download tokens.');
  }

  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const expSec = nowSec + ttlSeconds;
  const createdAtIso = new Date(nowMs).toISOString();
  const expiresAtIso = new Date(nowMs + ttlSeconds * 1000).toISOString();

  const jti = `volt_jti_${crypto.randomUUID().replace(/-/g, '')}`;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: DownloadTokenPayload = {
    orderId,
    jti,
    iat: nowSec,
    exp: expSec,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(dataToSign));
  const signatureB64 = base64UrlEncode(signature);

  const token = `${dataToSign}.${signatureB64}`;

  return {
    token,
    jti,
    expiresAtIso,
    createdAtIso,
  };
}

/**
 * Cryptographically verifies an opaque download token using HMAC-SHA256.
 */
export async function verifyDownloadToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: DownloadTokenPayload; error?: string }> {
  if (!secret || secret.trim().length === 0) {
    return { valid: false, error: 'JWT_SECRET_REQUIRED' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'INVALID_TOKEN_FORMAT' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const dataToSign = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(signatureB64);
    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      enc.encode(dataToSign)
    );

    if (!isValidSig) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload: DownloadTokenPayload = JSON.parse(payloadJson);

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && nowSec > payload.exp) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'VERIFICATION_FAILED' };
  }
}
