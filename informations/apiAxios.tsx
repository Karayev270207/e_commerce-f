import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

if (!BASE_URL) {
  console.error("❌ [API] EXPO_PUBLIC_API_URL is not set in .env!");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // Remove Content-Type for FormData so the native XHR sets the multipart boundary.
    if (config.data && typeof (config.data as any).append === "function") {
      delete (config.headers as any)["Content-Type"];
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // non-fatal
    }

    console.log(`📤 [${config.method?.toUpperCase()}] ${BASE_URL}/api${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ [API] Request setup failed:", error.message);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      const msg = error.response.data?.message ?? error.message;
      console.error(`❌ [${error.response.status}] ${error.config?.url} — ${msg}`);
    } else if (error.request) {
      console.error(
        `❌ [No Response] Cannot reach ${BASE_URL}`,
        "\n  → Check: is the backend running?",
        "\n  → Check: is EXPO_PUBLIC_API_URL correct in .env?",
        "\n  → Current value:", BASE_URL
      );
    } else {
      console.error("❌ [API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
