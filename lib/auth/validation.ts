export const MIN_PASSWORD_LENGTH = 8;
export const MAX_EMAIL_LENGTH = 254;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmailFormat(email: string): string | undefined {
  if (!email) return "Enter your email.";
  if (email.length > MAX_EMAIL_LENGTH) return "That email looks too long.";
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter your password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export function validateVerificationCode(code: string): string | undefined {
  const trimmed = code.trim();
  if (!trimmed) return "Enter the code from your email.";
  if (trimmed.length < 6) return "That code looks too short.";
  return undefined;
}
