export function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>]/g, "");
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const e = sanitizeInput(email);
  if (!e) return "Email is required";
  if (!emailRegex.test(e)) return "Enter a valid email address";
  return "";
}

export function validatePassword(password, isSignup = false) {
  const p = String(password ?? "");
  if (!p) return "Password is required";
  if (p.length < 8) return "Password must be at least 8 characters";
  if (isSignup) {
    if (!/[A-Z]/.test(p)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(p)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(p)) return "Password must contain a number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return "Password must contain a special character";
  }
  return "";
}

export function validateName(name) {
  const n = sanitizeInput(name);
  if (!n) return "Name is required";
  if (n.length < 2) return "Name must be at least 2 characters";
  return "";
}
