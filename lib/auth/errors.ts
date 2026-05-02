import { isClerkAPIResponseError } from "@clerk/expo";

function soften(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already") && lower.includes("exist")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (lower.includes("password")) {
    if (lower.includes("compromised") || lower.includes("breach")) {
      return "Choose a stronger password that you have not used elsewhere.";
    }
    if (lower.includes("incorrect") || lower.includes("invalid")) {
      return "That password does not match our records.";
    }
  }
  if (lower.includes("verification") || lower.includes("code")) {
    return "Check the code and try again, or request a new one.";
  }
  if (lower.includes("identifier") || lower.includes("email")) {
    return "We could not find an account with that email.";
  }
  if (lower.includes("session")) {
    return "Your session expired. Please sign in again.";
  }
  return raw.length > 120 ? "Something went wrong. Please try again." : raw;
}

export function mapClerkApiError(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors?.[0]?.message;
    if (first) return soften(first);
  }
  if (error instanceof Error && error.message.trim()) {
    return soften(error.message);
  }
  return "Something went wrong. Please try again.";
}

type FieldErrors = Record<string, unknown>;

function rawFieldMessage(fields: FieldErrors, key: string): string | undefined {
  const raw = fields[key];
  if (raw == null) return undefined;
  if (typeof raw === "object" && !Array.isArray(raw) && "message" in raw) {
    const m = (raw as { message?: string }).message;
    return m ? String(m) : undefined;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as { message?: string };
    if (first?.message) return String(first.message);
  }
  return undefined;
}

export function mapClerkFieldErrors(errors: unknown, key: string): string | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  const fields = (errors as { fields?: FieldErrors }).fields;
  const msg = fields ? rawFieldMessage(fields, key) : undefined;
  return msg ? soften(msg) : undefined;
}
