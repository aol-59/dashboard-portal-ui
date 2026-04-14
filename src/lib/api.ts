import { getToken, login } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (USE_MOCKS) {
    return getMockData<T>(path, options);
  }
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    login();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  department?: string;
  is_admin: boolean;
  entities: Record<string, string>;
  owned_entities: string[];
}

export interface EntitySummary {
  id: string;
  slug: string;
  display_id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  color: string;
  sort_order: number;
  access_status: "admin" | "owner" | "viewer" | "pending" | "locked";
}

export interface Notification {
  id: string;
  entity_slug: string;
  entity_name: string;
  entity_name_ar: string;
  requester_name: string;
  requester_email: string;
  reason?: string;
  created_at: string;
}

export interface PortalSummary {
  user: { id: string; email: string; display_name: string; is_admin: boolean };
  entities: EntitySummary[];
}

export interface AccessRequest {
  id: string;
  entity_slug: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  reviewed_at?: string;
  requester_email: string;
  requester_name: string;
  reviewer_email?: string;
}

export interface EntityAccessUser {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  department?: string;
  role: string;
  assigned_at: string;
}

export interface EntityAccess {
  owners: EntityAccessUser[];
  viewers: EntityAccessUser[];
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  department?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  entity_access: { entity_slug: string; role: string }[];
}

// API Functions
export const fetchMe = () => apiFetch<UserProfile>("/api/auth/me");
export const fetchPortalSummary = () => apiFetch<PortalSummary>("/api/v1/portal/summary");
export const fetchAccessRequests = () => apiFetch<AccessRequest[]>("/api/v1/access-requests");
export const createAccessRequest = (data: { entities: string[]; reason?: string }) =>
  apiFetch<void>("/api/v1/access-requests", { method: "POST", body: JSON.stringify(data) });
export const updateAccessRequest = (id: string, data: { status: "Approved" | "Rejected" }) =>
  apiFetch<void>(`/api/v1/access-requests/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const fetchEntityAccess = (slug: string) => apiFetch<EntityAccess>(`/api/v1/entity-access/${slug}`);
export const grantEntityAccess = (data: { user_id: string; entity_slug: string; role: string }) =>
  apiFetch<void>("/api/v1/entity-access", { method: "POST", body: JSON.stringify(data) });
export const revokeEntityAccess = (id: string) =>
  apiFetch<void>(`/api/v1/entity-access/${id}`, { method: "DELETE" });
export const fetchAdminUsers = () => apiFetch<AdminUser[]>("/api/admin/users");
export const createAdminUser = (data: { email: string; display_name: string; department?: string }) =>
  apiFetch<void>("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
export const updateAdminUser = (id: string, data: { display_name?: string; department?: string; is_active?: boolean }) =>
  apiFetch<void>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const toggleAdmin = (id: string, is_admin: boolean) =>
  apiFetch<void>(`/api/admin/users/${id}/admin`, { method: "PUT", body: JSON.stringify({ is_admin }) });
export const fetchNotificationCount = () => apiFetch<{ count: number }>("/api/notifications/count");
export const fetchNotifications = () => apiFetch<Notification[]>("/api/notifications");

// Mock Data
function getMockData<T>(path: string, options?: RequestInit): T {
  if (path === "/api/auth/me") {
    return {
      id: "1", email: "demo@example.com", display_name: "Demo User",
      department: "IT", is_admin: true, entities: { finance: "owner", hr: "viewer", operations: "viewer" },
      owned_entities: ["finance"],
    } as T;
  }
  if (path === "/api/v1/portal/summary") {
    return {
      user: { id: "1", email: "demo@example.com", display_name: "Demo User", is_admin: true },
      entities: [
        { id: "1", slug: "finance", display_id: "FN01", name: "Finance Dashboard", name_ar: "لوحة المالية", description: "Financial analytics and reporting", description_ar: "التحليلات المالية والتقارير", icon: "DollarSign", color: "#10B981", sort_order: 1, access_status: "owner" },
        { id: "2", slug: "hr", display_id: "HR02", name: "HR Dashboard", name_ar: "لوحة الموارد البشرية", description: "Human resources management", description_ar: "إدارة الموارد البشرية", icon: "Users", color: "#3B82F6", sort_order: 2, access_status: "viewer" },
        { id: "3", slug: "operations", display_id: "OP03", name: "Operations", name_ar: "العمليات", description: "Operational metrics and KPIs", description_ar: "مقاييس العمليات ومؤشرات الأداء", icon: "TrendingUp", color: "#F59E0B", sort_order: 3, access_status: "pending" },
        { id: "4", slug: "sales", display_id: "SA04", name: "Sales Pipeline", name_ar: "خط أنابيب المبيعات", description: "Sales tracking and forecasting", description_ar: "تتبع المبيعات والتنبؤ", icon: "ShoppingCart", color: "#EF4444", sort_order: 4, access_status: "locked" },
      ],
    } as T;
  }
  if (path === "/api/v1/access-requests") {
    if (options?.method === "POST") return undefined as T;
    return [
      { id: "1", entity_slug: "analytics", reason: "Need for quarterly report", status: "Pending", created_at: "2024-03-15T10:00:00Z", requester_email: "john@example.com", requester_name: "John Doe" },
      { id: "2", entity_slug: "finance", reason: "Budget review", status: "Approved", created_at: "2024-03-10T08:00:00Z", reviewed_at: "2024-03-11T09:00:00Z", requester_email: "jane@example.com", requester_name: "Jane Smith", reviewer_email: "admin@example.com" },
      { id: "3", entity_slug: "hr", status: "Rejected", created_at: "2024-03-08T14:00:00Z", reviewed_at: "2024-03-09T10:00:00Z", requester_email: "bob@example.com", requester_name: "Bob Wilson", reviewer_email: "admin@example.com" },
    ] as T;
  }
  if (path.startsWith("/api/v1/entity-access/")) {
    return {
      owners: [{ id: "1", user_id: "1", email: "demo@example.com", display_name: "Demo User", department: "IT", role: "owner", assigned_at: "2024-01-01T00:00:00Z" }],
      viewers: [{ id: "2", user_id: "2", email: "john@example.com", display_name: "John Doe", department: "Finance", role: "viewer", assigned_at: "2024-02-01T00:00:00Z" }],
    } as T;
  }
  if (path === "/api/admin/users") {
    return [
      { id: "1", email: "demo@example.com", display_name: "Demo User", department: "IT", is_admin: true, is_active: true, created_at: "2024-01-01T00:00:00Z", last_login: "2024-03-15T10:00:00Z", entity_access: [{ entity_slug: "finance", role: "owner" }] },
      { id: "2", email: "john@example.com", display_name: "John Doe", department: "Finance", is_admin: false, is_active: true, created_at: "2024-01-15T00:00:00Z", last_login: "2024-03-14T08:00:00Z", entity_access: [{ entity_slug: "finance", role: "viewer" }, { entity_slug: "hr", role: "viewer" }] },
      { id: "3", email: "jane@example.com", display_name: "Jane Smith", department: "HR", is_admin: false, is_active: false, created_at: "2024-02-01T00:00:00Z", entity_access: [] },
    ] as T;
  }
  return {} as T;
}
