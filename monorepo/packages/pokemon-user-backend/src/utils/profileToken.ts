import crypto from 'crypto';

function base64urlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input: string): Buffer {
  // convert base64url -> base64 and pad
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
  return Buffer.from(padded, 'base64');
}

/**
 * Sign a JSON payload and return "<payloadB64>.<sigB64>"
 */
export function signPayload(payloadObj: object, secret: string): string {
  const payloadJson = JSON.stringify(payloadObj);
  const payloadB64 = base64urlEncode(Buffer.from(payloadJson, 'utf8'));
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest();
  const sigB64 = base64urlEncode(signature);
  return `${payloadB64}.${sigB64}`;
}

export function verifyToken(token: string, secret: string): { ok: true; payload: any } | { ok: false; reason: string } {
  try {
    if (!token || typeof token !== 'string') return { ok: false, reason: 'invalid token' };
    const parts = token.split('.');
    if (parts.length !== 2 && parts.length !== 3) return { ok: false, reason: 'bad format' };

    const [payloadB64, sigB64] = [parts[0], parts[1]];

    // compute expected signature
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest();

    // decode provided signature
    const providedSig = base64urlDecode(sigB64);

    // timingSafeEqual expects ArrayBufferView; convert Buffers -> Uint8Array
    const providedArr = Uint8Array.from(providedSig);
    const expectedArr = Uint8Array.from(expectedSig);
    if (providedArr.length !== expectedArr.length || !crypto.timingSafeEqual(providedArr, expectedArr)) {
      return { ok: false, reason: 'bad signature' };
    }

    // decode payload
    const payloadJson = base64urlDecode(payloadB64).toString('utf8');
    const payload = JSON.parse(payloadJson);

    // optional expiry check (if payload contains `exp` as unix seconds)
    if (payload && payload.exp && Number(payload.exp) > 0) {
      const now = Math.floor(Date.now() / 1000);
      if (Number(payload.exp) < now) return { ok: false, reason: 'expired' };
    }

    return { ok: true, payload };
  } catch (err) {
    return { ok: false, reason: 'parse error' };
  }
}
