/**
 * Allowlisted query keys safe to attach to PostHog screen payloads.
 * Never add OAuth/OIDC or auth-adjacent keys (e.g. code, token, email, redirect,
 * access_token, session) to ALLOWLIST—only marketing/attribution-style keys.
 */
const ALLOWLIST = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "campaign",
] as const;

const MAX_PARAM_LENGTH = 200;

function normalizeParam(value: unknown): string | null {
  if (value == null) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_PARAM_LENGTH);
}

/**
 * Builds a PostHog-safe subset of global search params for screen context.
 */
export function filterScreenQueryParams(
  params: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const key of ALLOWLIST) {
    const normalized = normalizeParam(params[key]);
    if (normalized == null) continue;
    out[key] = normalized;
  }

  return out;
}
