import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createCommerceAreaAPI,
  deleteCommerceAreaAPI,
  getCommerceAreas,
  updateCommerceAreaAPI,
} from "./apiPort";
import { TypeCommerceArea } from "./types";

const CACHE_PREFIX = "@commerce_area_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface CommerceAreaStore {
  myArea: TypeCommerceArea | null;
  loading: boolean;
  error: string;
  initialized: boolean;

  loadMyArea: (customerId: number) => Promise<void>;
  createArea: (data: {
    customer_id: number;
    area_name: string;
    description?: string;
    imageUri?: string;
  }) => Promise<void>;
  updateArea: (
    id: number,
    data: { area_name?: string; description?: string; is_active?: boolean; imageUri?: string },
  ) => Promise<void>;
  deleteArea: (id: number) => Promise<void>;
  clearError: () => void;
  resetArea: () => void;
}

export const useCommerceArea = create<CommerceAreaStore>((set, get) => ({
  myArea: null,
  loading: false,
  error: "",
  initialized: false,

  // ─── Load the current user's area (cache-first) ───
  loadMyArea: async (customerId: number) => {
    try {
      set({ loading: true, error: "" });

      const cacheKey = `${CACHE_PREFIX}${customerId}`;
      const raw = await AsyncStorage.getItem(cacheKey);

      if (raw) {
        const { area, ts } = JSON.parse(raw) as {
          area: TypeCommerceArea;
          ts: number;
        };
        if (Date.now() - ts < CACHE_TTL) {
          set({ myArea: area, initialized: true, loading: false });
          return;
        }
      }

      // Fetch fresh list and find by customer_id
      const areas = await getCommerceAreas();
      const found =
        areas.find((a) => Number(a.customer_id) === customerId) ?? null;

      if (found) {
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ area: found, ts: Date.now() }),
        );
      } else {
        await AsyncStorage.removeItem(cacheKey);
      }

      set({ myArea: found, initialized: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load commerce area";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  // ─── Create a new commerce area ───
  createArea: async (data) => {
    try {
      set({ loading: true, error: "" });
      const result = await createCommerceAreaAPI(data);
      const area: TypeCommerceArea = result.commerce_area;

      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${data.customer_id}`,
        JSON.stringify({ area, ts: Date.now() }),
      );

      set({ myArea: area });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create commerce area";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  // ─── Update existing area ───
  updateArea: async (id, data) => {
    try {
      set({ loading: true, error: "" });
      const result = await updateCommerceAreaAPI(id, data);
      const updated: TypeCommerceArea = result.commerce_area;

      const current = get().myArea;
      if (current) {
        await AsyncStorage.setItem(
          `${CACHE_PREFIX}${current.customer_id}`,
          JSON.stringify({ area: updated, ts: Date.now() }),
        );
      }

      set({ myArea: updated });
    } catch (err: any) {
      const msg = err?.message || "Failed to update commerce area";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  // ─── Delete area ───
  deleteArea: async (id) => {
    try {
      set({ loading: true, error: "" });
      await deleteCommerceAreaAPI(id);

      const current = get().myArea;
      if (current) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${current.customer_id}`);
      }

      set({ myArea: null });
    } catch (err: any) {
      const msg = err?.message || "Failed to delete commerce area";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: "" }),
  resetArea: () =>
    set({ myArea: null, loading: false, error: "", initialized: false }),
}));
