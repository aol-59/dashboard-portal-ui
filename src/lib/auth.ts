import Keycloak from "keycloak-js";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const keycloak = USE_MOCKS
  ? null
  : new Keycloak({
      url: import.meta.env.VITE_AUTH_URL || "http://localhost:8180",
      realm: import.meta.env.VITE_AUTH_REALM || "dashboard",
      clientId: import.meta.env.VITE_AUTH_CLIENT_ID || "dashboard-app",
    });

let initialized = false;

export async function initAuth(): Promise<boolean> {
  if (USE_MOCKS) {
    initialized = true;
    return true;
  }
  if (!keycloak || initialized) return keycloak?.authenticated ?? false;
  try {
    const auth = await keycloak.init({ onLoad: "check-sso", silentCheckSsoRedirectUri: undefined });
    initialized = true;
    if (auth) {
      // Auto-refresh token
      setInterval(() => {
        keycloak.updateToken(30).catch(() => keycloak.logout());
      }, 30000);
    }
    return auth;
  } catch (err) {
    console.error("Keycloak init failed", err);
    initialized = true;
    return false;
  }
}

export function login() {
  if (USE_MOCKS) {
    localStorage.setItem("mock_authenticated", "true");
    window.location.href = "/portal";
    return;
  }
  keycloak?.login();
}

export function logout() {
  if (USE_MOCKS) {
    localStorage.removeItem("mock_authenticated");
    window.location.href = "/";
    return;
  }
  keycloak?.logout({ redirectUri: window.location.origin });
}

export function isAuthenticated(): boolean {
  if (USE_MOCKS) return localStorage.getItem("mock_authenticated") === "true";
  return keycloak?.authenticated ?? false;
}

export function getToken(): string | undefined {
  if (USE_MOCKS) return "mock-token";
  return keycloak?.token;
}

export function getTokenParsed() {
  if (USE_MOCKS) {
    return { name: "Demo User", email: "demo@example.com", preferred_username: "demo" };
  }
  return keycloak?.tokenParsed;
}
