const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("mediflow_token");
}

function getHeaders(includeAuth = true) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const config = {
    method,
    headers: getHeaders(auth),
  };
  if (body && method !== "GET") config.body = JSON.stringify(body);

  const res = await fetch(url, config);
  if (res.status === 401) {
    localStorage.removeItem("mediflow_token");
    localStorage.removeItem("mediflow_user");
    window.dispatchEvent(new Event("auth-logout"));
    throw new Error("Unauthorized");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

// Backend connection check (no auth required)
export async function checkBackendHealth() {
  try {
    const data = await apiRequest("/health", { auth: false });
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

// Auth APIs
export const authApi = {
  login: async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false
    });
    // Store token and user details
    if (data.token) {
      localStorage.setItem("mediflow_token", data.token);
      localStorage.setItem("mediflow_user", JSON.stringify(data.user));
    }
    return data;
  },
  signup: async (name, email, password, role = "Viewer") => {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: { name, email, password, role },
      auth: false
    });
    // Store token and user details
    if (data.token) {
      localStorage.setItem("mediflow_token", data.token);
      localStorage.setItem("mediflow_user", JSON.stringify(data.user));
    }
    return data;
  },
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (token, newPassword) =>
    apiRequest("/auth/reset-password", { method: "POST", body: { token, newPassword }, auth: false }),
};

// Dashboard / resources (mock data used in components when API fails)
// Dashboard / resources (mock data used in components when API fails)
export const dashboardApi = {
  getOverview: () => apiRequest("/dashboard/overview").catch(() => null),
  getBloodStats: () => apiRequest("/blood/stats").catch(() => null),
  getMedicineStats: () => apiRequest("/medicine/stats").catch(() => null),
  getEquipmentStats: () => apiRequest("/equipment/stats").catch(() => null),
  getAlerts: (coordinatorId) => {
    const url = coordinatorId ? `/alerts?coordinatorId=${coordinatorId}` : "/alerts";
    return apiRequest(url).catch(() => null);
  },
  createAlert: (alertData) => apiRequest("/alerts", { method: "POST", body: alertData, auth: true }),
  updateAlertStatus: (id, status) => apiRequest(`/alerts/${id}/status`, { method: "PUT", body: { status } }),
  deleteAlert: (id) => apiRequest(`/alerts/${id}`, { method: "DELETE" }),
};

export const coordinatorApi = {
  getAll: () => apiRequest("/users/coordinators", { auth: false }),
};

export const inventoryApi = {
  getAll: () => apiRequest("/inventory"),
  getByCategory: (category) => apiRequest(`/inventory/category/${category}`),
  create: (item) => apiRequest("/inventory", { method: "POST", body: item }),
};

export const bloodBankApi = {
  getAll: () => apiRequest("/blood-bank"),
  create: (bag) => apiRequest("/blood-bank", { method: "POST", body: bag }),
};


const MOCK_ADMIN_OVERVIEW = {
  usersTotal: 24,
  staffTotal: 7,
  adminsTotal: 2,
  activeAlerts: 3,
  lastUpdated: new Date().toISOString(),
};

const MOCK_USERS = [
  { id: "u1", name: "Bhumika", email: "bhumika@example.com", role: "Admin", active: true, createdAt: "2026-02-01T09:10:00Z" },
  { id: "u2", name: "Dr. Patel", email: "patel@example.com", role: "Staff", active: true, createdAt: "2026-02-02T10:25:00Z" },
  { id: "u3", name: "Nurse Shah", email: "shah@example.com", role: "Staff", active: true, createdAt: "2026-02-05T08:40:00Z" },
  { id: "u4", name: "Viewer User", email: "viewer@example.com", role: "Viewer", active: true, createdAt: "2026-02-10T11:05:00Z" },
  { id: "u5", name: "Inactive User", email: "inactive@example.com", role: "Viewer", active: false, createdAt: "2026-02-12T16:20:00Z" },
];

const MOCK_LOGS = [
  { id: "l1", time: "2026-02-17T09:12:00Z", actor: "System", action: "Health check", level: "info", detail: "Backend health endpoint checked" },
  { id: "l2", time: "2026-02-17T12:30:00Z", actor: "Admin", action: "Role change", level: "warn", detail: "Changed role for user u4 to Staff (mock)" },
  { id: "l3", time: "2026-02-17T18:05:00Z", actor: "Admin", action: "Deactivate user", level: "info", detail: "Deactivated user u5 (mock)" },
];

export const adminApi = {
  getOverview: () => apiRequest("/admin/overview").catch(() => MOCK_ADMIN_OVERVIEW),
  getUsers: () => apiRequest("/admin/users").catch(() => MOCK_USERS),
  updateUserRole: (userId, role) =>
    apiRequest(`/admin/users/${encodeURIComponent(String(userId))}/role`, { method: "PUT", body: { role } }),
  setUserActive: (userId, active) =>
    apiRequest(`/admin/users/${encodeURIComponent(String(userId))}/active`, { method: "PUT", body: { active } }),
  getSettings: () => apiRequest("/admin/settings").catch(() => null),
  updateSettings: (settings) => apiRequest("/admin/settings", { method: "PUT", body: settings }),
  getLogs: () => apiRequest("/admin/logs").catch(() => MOCK_LOGS),
  getDonors: () => apiRequest("/admin/donors").catch(() => []),
};

export const donationApi = {
  create: (data) => apiRequest("/users/donate", { method: "POST", body: data }),
  getAll: () => apiRequest("/admin/donation-requests"),
  update: (id, data) => apiRequest(`/admin/donation-requests/${id}`, { method: "PUT", body: data }),
};

export const userApi = {
  getAll: () => apiRequest("/users"),
  create: (user) => apiRequest("/users", { method: "POST", body: user }),
  getProfile: (id) => apiRequest(`/users/profile/${id}`),
  updateProfile: (id, data) => apiRequest(`/users/profile/${id}`, { method: "PUT", body: data }),
  getDonations: (id) => apiRequest(`/users/donations/${id}`),
  addDonation: (id, data) => apiRequest(`/users/donations/${id}`, { method: "POST", body: data }),
  deleteDonation: (id) => apiRequest(`/users/donation/${id}`, { method: "DELETE" }),
  getMyRequests: () => apiRequest("/users/my-requests"),
};
