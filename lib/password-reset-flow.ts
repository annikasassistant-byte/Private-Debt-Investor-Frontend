const EMAIL_KEY = "depth-reset-email";
const VERIFIED_KEY = "depth-reset-otp-verified";

/** Demo OTP for password recovery (frontend only). */
export const DEMO_RESET_OTP = "123456";

export function setResetEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EMAIL_KEY, email);
  sessionStorage.removeItem(VERIFIED_KEY);
}

export function getResetEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function markOtpVerified() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(VERIFIED_KEY, "1");
}

export function isOtpVerified(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(VERIFIED_KEY) === "1";
}

export function clearPasswordResetFlow() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(VERIFIED_KEY);
}
