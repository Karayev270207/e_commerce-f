import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ─── Request Interceptor ───
api.interceptors.request.use(
  async (config) => {
    // Retrieve token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("⚠️ [API] Failed to retrieve token:", error);
    }

    console.log(
      `📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
      {
        data: config.data,
        params: config.params,
        headers: config.headers,
      },
    );
    return config;
  },
  (error) => {
    console.error("❌ [API Request Error]", error);
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ───
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      },
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ [API Response Error] ${error.response.status}`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || error.message,
      });
    } else if (error.request) {
      // Request made but no response
      console.error("❌ [API Request Error - No Response]", {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      // Error in request setup
      console.error("❌ [API Error]", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
