import { create } from "zustand";
import {
  addProduct,
  addToCartAPI,
  createOrder,
  deleteCartItem,
  getCart,
  getCartById,
  getCategories,
  getProducts,
  updateCartItem,
} from "./apiPort";
import { useLogin } from "./loginContext";
import { CartItem, PostProduct, Product, TypeCategory } from "./types";

// ─── Store type ───────────────────────────────────────────────────────────────
export interface ContextType {
  products:        Product[];
  categories:      TypeCategory[];
  cart:            CartItem[];
  isError:         string;
  loading:         boolean;
  cartLoading:     boolean;
  cartError:       string;
  selectedCartItem: CartItem | null;

  refreshProducts:  () => Promise<void>;
  postProduct:      (product: PostProduct) => Promise<void>;
  addToCart:        (product: Product) => Promise<void>;
  minusCart:        (item: CartItem) => Promise<void>;
  removeCart:       (cartItemId: number) => Promise<void>;
  clearCart:        () => void;
  placeOrder:       (phone: string, address: string) => Promise<void>;
  fetchCart:        () => Promise<void>;
  fetchCartById:    (id: number) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useApiCreate = create<ContextType>((set, get) => ({
  products:         [],
  categories:       [],
  cart:             [],
  isError:          "",
  loading:          false,
  cartLoading:      false,
  cartError:        "",
  selectedCartItem: null,

  // ─── Products ───
  refreshProducts: async () => {
    set({ loading: true, isError: "" });
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      set({ products: prods, categories: cats });
      console.log(`✅ [Provider] Loaded ${prods.length} products, ${cats.length} categories`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      console.error("❌ [Provider] Failed to fetch data:", msg);
      set({ isError: msg });
    } finally {
      set({ loading: false });
    }
  },

  postProduct: async (product: PostProduct) => {
    set({ loading: true, isError: "" });
    try {
      await addProduct(product);
      console.log("✅ [Provider] Product created — refreshing list...");
      // Refresh in background; don't let a refresh failure mask the creation success
      get().refreshProducts().catch((err) =>
        console.warn("⚠️ [Provider] Refresh after post failed:", err.message)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add product";
      console.error("❌ [Provider] Failed to add product:", msg);
      set({ isError: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ─── Cart ───
  addToCart: async (product: Product) => {
    set({ cartLoading: true, cartError: "" });
    try {
      const customer = useLogin.getState().users;
      if (!customer?.id) throw new Error("You must be logged in to add items to cart");

      const productId = (product as any).product_id ?? product.id;
      await addToCartAPI(customer.id, productId, 1);
      await get().fetchCart();
      console.log(`✅ [Provider] Product ${productId} added to cart`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      console.error("❌ [Provider] Add to cart failed:", msg);
      set({ cartError: msg });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },

  minusCart: async (item: CartItem) => {
    if (item.quantity <= 1) {
      return get().removeCart(item.id);
    }
    const newQty = item.quantity - 1;
    // Optimistic update
    set((state) => ({
      cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: newQty } : c),
    }));
    try {
      await updateCartItem(item.id, newQty);
    } catch {
      // Rollback on failure
      set((state) => ({
        cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: item.quantity } : c),
      }));
    }
  },

  removeCart: async (cartItemId: number) => {
    set({ cartLoading: true, cartError: "" });
    try {
      await deleteCartItem(cartItemId);
      set((state) => ({ cart: state.cart.filter((c) => c.id !== cartItemId) }));
      console.log(`✅ [Provider] Cart item ${cartItemId} removed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove item";
      console.error("❌ [Provider] Remove cart failed:", msg);
      set({ cartError: msg });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },

  clearCart: () => set({ cart: [], cartError: "" }),

  fetchCart: async () => {
    set({ cartLoading: true, cartError: "" });
    try {
      const customer = useLogin.getState().users;
      if (!customer?.id) throw new Error("You must be logged in to view cart");

      const cartItems = await getCart(customer.id);
      set({ cart: cartItems as CartItem[] });
      console.log(`✅ [Provider] Cart loaded: ${cartItems.length} items`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch cart";
      console.error("❌ [Provider] Fetch cart failed:", msg);
      set({ cartError: msg });
    } finally {
      set({ cartLoading: false });
    }
  },

  fetchCartById: async (id: number) => {
    set({ cartLoading: true, cartError: "" });
    try {
      const item = await getCartById(id);
      set({ selectedCartItem: item });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch cart item";
      set({ cartError: msg });
    } finally {
      set({ cartLoading: false });
    }
  },

  // ─── Orders ───
  placeOrder: async (phone: string, address: string) => {
    set({ cartLoading: true, cartError: "" });
    try {
      const { cart } = get();
      if (cart.length === 0) throw new Error("Cart is empty");

      const customer = useLogin.getState().users;
      if (!customer?.id) throw new Error("You must be logged in to place an order");

      const cartId     = cart[0]?.cart_id ?? cart[0]?.id ?? 0;
      const totalPrice = cart.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);

      const result = await createOrder(cartId, phone, address, totalPrice);
      set({ cart: [] });
      console.log("✅ [Provider] Order placed:", result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      console.error("❌ [Provider] Place order failed:", msg);
      set({ cartError: msg });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },
}));
