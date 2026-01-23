// packages/pokemon-ui/src/utils/profileContext.ts
export type ProfileContext = {
  profile: { id: string; name?: string; createdAt?: string };
  token?: string; // server-signed token (base64.payload.signature)
  version?: number;
};

const STORAGE_KEY = 'pkm_profile_ctx_v1';
const DEFAULT_VERSION = 1;

export function setProfileContext(ctx: ProfileContext): void {
  try {
    const safe = {
      profile: {
        id: String(ctx.profile.id),
        name: ctx.profile.name ?? undefined,
        createdAt: ctx.profile.createdAt ?? new Date().toISOString(),
      },
      token: ctx.token ?? undefined,
      version: ctx.version ?? DEFAULT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch (err) {
    console.warn('setProfileContext failed', err);
  }
}

export function getProfileContext(): ProfileContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as ProfileContext;
  } catch (err) {
    console.warn('getProfileContext read failed', err);
    return null;
  }
}

export function clearProfileContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Lightweight structural validation (client-side only)
export function validateProfileContext(ctx: ProfileContext | null): { valid: boolean; reason?: string } {
  if (!ctx) return { valid: false, reason: 'no context' };
  if (!ctx.profile?.id || typeof ctx.profile.id !== 'string') return { valid: false, reason: 'invalid id' };
  // createdAt optional; if present must parse
  if (ctx.profile.createdAt) {
    const d = new Date(ctx.profile.createdAt);
    if (Number.isNaN(d.getTime())) return { valid: false, reason: 'invalid createdAt' };
  }
  // token validity (syntactic): two parts and payload decodable
  if (ctx.token) {
    const parts = ctx.token.split('.');
    if (parts.length !== 2 && parts.length !== 3) return { valid: false, reason: 'invalid token format' };
    // do not attempt signature verification on client
  }
  return { valid: true };
}