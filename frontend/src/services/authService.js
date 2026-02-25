// Mock auth for frontend-only; replace with real api calls when backend is ready
const MOCK_USERS = [
  { id: "1", name: "Admin User", email: "admin@mediflow.com", password: "Admin@123", role: "Admin" },
  { id: "2", name: "Staff User", email: "staff@mediflow.com", password: "Staff@123", role: "Staff" },
  { id: "3", name: "Viewer User", email: "viewer@mediflow.com", password: "Viewer@123", role: "Viewer" },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockLogin(email, password) {
  await delay(600);
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid email or password");
  const { password: _, ...safe } = user;
  return { user: safe, token: `mock-jwt-${user.id}-${Date.now()}` };
}

export async function mockSignup(name, email, password, role = "Viewer") {
  await delay(600);
  if (MOCK_USERS.some((u) => u.email === email)) throw new Error("Email already registered");
  const id = String(MOCK_USERS.length + 1);
  MOCK_USERS.push({ id, name, email, password, role });
  const user = { id, name, email, role };
  return { user, token: `mock-jwt-${id}-${Date.now()}` };
}

export async function mockForgotPassword(email) {
  await delay(600);
  const exists = MOCK_USERS.some((u) => u.email === email);
  if (!exists) throw new Error("No account found with this email");
  return { message: "Reset link sent to your email (simulated)" };
}

export async function mockResetPassword(token, newPassword) {
  await delay(600);
  if (!token || !newPassword) throw new Error("Invalid or expired reset link");
  return { message: "Password reset successful" };
}
