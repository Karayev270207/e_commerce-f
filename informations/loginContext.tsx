import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { loginCustomer, registerCustomer } from "./apiPort";
import { TypeCustomer } from "./types";

export interface AuthState {
  isLoading: boolean;
  users: TypeCustomer | null;
  token: string | null;
  login:    (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: Omit<TypeCustomer, "id">)  => Promise<{ success: boolean; error?: string }>;
  logout:   () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLogin = create<AuthState>((set) => ({
  isLoading: false,
  users: null,
  token: null,

  // ─── Restore session from storage on app start ───
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("auth_token"),
      ]);
      if (storedUser) {
        set({ users: JSON.parse(storedUser), token: storedToken });
        console.log("✅ [Auth] Session restored");
      }
    } catch (err) {
      console.error("❌ [Auth] Failed to restore session:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Register ───
  register: async (userData) => {
    set({ isLoading: true });
    try {
      if (!userData.email?.trim() || !userData.password?.trim()) {
        throw new Error("Email and password are required");
      }
      if (!userData.username?.trim() || !userData.surname?.trim()) {
        throw new Error("First name and last name are required");
      }

      const resp  = await registerCustomer(userData);
      const token = resp.accessToken ?? null;

      const newUser: TypeCustomer = {
        id:       resp.user?.id ?? resp.id,
        email:    userData.email.trim(),
        username: userData.username.trim(),
        surname:  userData.surname.trim(),
        password: "",
      };

      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      if (token) await AsyncStorage.setItem("auth_token", token);
      set({ users: newUser, token });

      console.log("✅ [Auth] Registered, user id:", newUser.id);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      console.error("❌ [Auth] Register error:", msg);
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Login ───
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      if (!email?.trim() || !password?.trim()) {
        throw new Error("Email and password are required");
      }

      const resp  = await loginCustomer({ email: email.trim(), password: password.trim() });
      const token = resp.accessToken ?? null;

      if (!resp.user?.id) {
        throw new Error("Invalid login response: missing user ID");
      }

      const loggedInUser: TypeCustomer = {
        id:       resp.user.id,
        email:    email.trim(),
        username: resp.user.username,
        surname:  resp.user.surname,
        password: "",
      };

      await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
      if (token) await AsyncStorage.setItem("auth_token", token);
      set({ users: loggedInUser, token });

      console.log("✅ [Auth] Login successful, user id:", loggedInUser.id);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      console.error("❌ [Auth] Login error:", msg);
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Logout — clears session only, does NOT delete the account ───
  logout: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("user"),
        AsyncStorage.removeItem("auth_token"),
      ]);
    } catch (err) {
      console.error("❌ [Auth] Error clearing storage on logout:", err);
    } finally {
      set({ users: null, token: null });
      console.log("✅ [Auth] Logged out");
    }
  },
}));
