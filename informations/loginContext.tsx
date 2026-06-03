import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { deleteCustomer, loginCustomer, registerCustomer } from "./apiPort";
import { TypeCustomer } from "./types";

// ─── Context Types ───
export interface AuthState {
  isLoading: boolean;
  users: TypeCustomer | null;
  token: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    user: Omit<TypeCustomer, "id">,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

// ─── Hook ───
export const useLogin = create<AuthState>((set, get) => ({
  isLoading: false,
  users: null,
  token: null,

  initialize: async () => {
    console.log("🔐 [Auth] Restoring session...");
    set({ isLoading: true });
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("auth_token");

      if (storedUser) {
        const restoredUser = JSON.parse(storedUser);
        set({ users: restoredUser, token: storedToken });
        console.log("✅ [Auth] Session restored");
      } else {
        console.log("ℹ️ [Auth] No stored session found");
      }
    } catch (error) {
      console.error("❌ [Auth] Failed to restore session:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (
    userData: Omit<TypeCustomer, "id">,
  ): Promise<{ success: boolean; error?: string }> => {
    set({ isLoading: true });
    try {
      // Validate inputs before sending
      if (!userData.email?.trim() || !userData.password?.trim()) {
        throw new Error("Email and password are required");
      }
      if (!userData.username?.trim() || !userData.surname?.trim()) {
        throw new Error("First name and last name are required");
      }

      console.log("🔐 [Auth] Registering new customer...");
      const resp = await registerCustomer(userData);
      const newUser: TypeCustomer = {
        email: userData.email.trim(),
        username: userData.username.trim(),
        surname: userData.surname.trim(),
        password: userData.password.trim(),
        id: resp.user?.id ?? resp.id ?? resp.newUser?.id,
      };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      set({ users: newUser });
      console.log("✅ [Auth] Registration successful");
      return { success: true };
    } catch (error) {
      let msg = "Registration failed";
      if (error instanceof Error) {
        msg = error.message;
      } else if (typeof error === "object" && error !== null) {
        msg =
          (error as any).message ||
          (error as any).error ||
          JSON.stringify(error);
      }
      console.error("❌ [Auth] Registration error:", msg);
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    set({ isLoading: true });
    try {
      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        throw new Error("Email and password are required");
      }

      console.log("🔐 [Auth] Logging in user:", email.trim());
      const resp = await loginCustomer({
        email: email.trim(),
        password: password.trim(),
      });

      // Extract token from response
      const token = resp.token || resp.access_token || resp.auth_token;

      const loggedInUser: TypeCustomer = {
        email: email.trim(),
        password: password.trim(),
        id: resp.user?.id ?? resp.id,
        username: resp.user?.username,
        surname: resp.user?.surname,
      };

      if (!loggedInUser.email) {
        throw new Error("Invalid login response: missing user data");
      }

      // Store user and token
      await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
      if (token) {
        await AsyncStorage.setItem("auth_token", token);
        set({ users: loggedInUser, token });
      } else {
        set({ users: loggedInUser, token: null });
      }

      console.log("✅ [Auth] Login successful");
      return { success: true };
    } catch (error) {
      let msg = "Invalid email or password";
      if (error instanceof Error) {
        msg = error.message;
      } else if (typeof error === "object" && error !== null) {
        msg =
          (error as any).message ||
          (error as any).error ||
          JSON.stringify(error);
      }
      console.error("❌ [Auth] Login error:", msg);
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      console.log("🔐 [Auth] Logging out user...");
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const storedUser = JSON.parse(stored) as TypeCustomer;
        if (storedUser.id) {
          try {
            await deleteCustomer(storedUser.id);
            console.log("✅ [Auth] Customer deleted successfully");
          } catch (error) {
            console.warn(
              "⚠️ [Auth] Failed to delete customer, but continuing logout:",
              error,
            );
          }
        }
      }
    } catch (error) {
      console.error("❌ [Auth] Logout error:", error);
    } finally {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("auth_token");
      set({ users: null, token: null, isLoading: false });
      console.log("✅ [Auth] User cleared from storage");
    }
  },
}));
