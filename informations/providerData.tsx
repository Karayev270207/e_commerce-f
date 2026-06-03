import { create } from "zustand";
import {
  addProduct,
  addToCartAPI,
  createOrder,
  deleteCartItem,
  getCategories,
  getProducts,
} from "./apiPort";
import { TypeCustomer,CartItem, PostProduct, Product, TypeCategory } from "./types";

// ─── store Type ───
export interface ContextType {
  products: Product[];
  categories: TypeCategory[];
  cart: CartItem[];
  isError: string;
  loading: boolean;
  cartLoading: boolean;
  cartError: string;
  addToCart: (customer: TypeCustomer, product: Product) => Promise<void>;
  minusCart: (product: CartItem) => void;
  removeCart: (id: number) => Promise<void>;
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  postProduct: (product: PostProduct) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

// ─── Hook (this is what cart.tsx, post.tsx, category/index.tsx import) ───
export const useApiCreate = create<ContextType>((set, get) => ({
  customer:[],
  products: [],
  categories: [],
  cart: [],
  isError: "",
  loading: false,
  cartLoading: false,
  cartError: "",

  refreshProducts: async () => {
    try {
      console.log("📡 [Provider] Fetching products and categories...");
      set({ loading: true, isError: "" });
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      set({ products: prods, categories: cats });
      console.log("✅ [Provider] Data fetched successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ [Provider] Failed to fetch data:", errorMessage);
      set({ isError: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  postProduct: async (product: PostProduct) => {
    try {
      console.log("📡 [Provider] Adding new product...", product);
      set({ loading: true, isError: "" });
      await addProduct(product);
      console.log("✅ [Provider] Product added, refreshing products list...");
      await get().refreshProducts();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add product";
      console.error("❌ [Provider] Failed to add product:", errorMessage);
      set({ isError: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (customer: TypeCustomer, product: Product) => {
    try {
      set({ cartLoading: true, cartError: "" });

      // API-a goşmak we maglumatlary almak
      console.log(`📝 [Provider] Adding product ${product.id} to cart API... \nAdding customer ${customer.id}`);
      const cartItemResponse = await addToCartAPI(product.id, 1);
      
      const cartItemId = cartItemResponse?.id;
      const customerId = cartItemResponse?.customer_id; // <--- customer_id alyndy

      // Local state-e goşmak
      set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        const existing2 = state.cart.find((item) => item.customer_id === customer.id);
        if (existing && existing2) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id && item.customer_id === customer.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        }
        
        return {
          cart: [
            ...state.cart,
            {
              ...customerId && { customer_id: customerId }, // <--- customer_id goşulýar
              ...product,
              cart_id: cartItemId,
              quantity: 1,
            } as CartItem,
          ],
        };
      });

      console.log(
        `✅ [Provider] Product ${product.id} added to cart with cart_id ${cartItemId} and customer_id ${customer.id}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      console.error("❌ [Provider] Failed to add to cart:", errorMessage);
      set({ cartError: errorMessage });
      throw error;
    } finally {
      set({ cartLoading: false });
    }
  },

  minusCart: (product: CartItem) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === product.id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    }));
  },

  removeCart: async (productId: number) => {
    try {
      set({ cartLoading: true, cartError: "" });

      // Cart_id we customer_id tapmak
      const cartItem = get().cart.find((item) => item.id === productId);
      if (!cartItem) {
        throw new Error("Cart item not found");
      }
      
      const customerId = cartItem.customer_id;
      const cartItemId = cartItem.id;
      
      console.log(
        `📝 [Provider] Removing cart item ${cartItemId} (customer ${customerId}) (product ${productId})...`,
      );
      await deleteCartItem(cartItemId);

      // Local state-den aýyrmak
      set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId),
      }));

      console.log(`✅ [Provider] Cart item ${cartItemId} removed`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove from cart";
      console.error("❌ [Provider] Failed to remove from cart:", errorMessage);
      set({ cartError: errorMessage });
      throw error;
    } finally {
      set({ cartLoading: false });
    }
  },

  clearCart: () => {
    set({ cart: [] });
  },

  placeOrder: async () => {
    try {
      set({ cartLoading: true, cartError: "" });

      const state = get();
      if (state.cart.length === 0) {
        throw new Error("Cart is empty");
      }

      console.log(
        `📝 [Provider] Creating order for ${state.cart.length} items...`,
      );

      // Eger backend-iňiz order döretmek üçin müşderiniň hakyky cart_id belgisini
      // talap edýän bolsa, '1' ýerine state.cart[0]?.cart_id ulanyp bilersiňiz:
      // const orderCartId = state.cart[0]?.cart_id || 1;
      
      const result = await createOrder(1);

      // Üstünlikli buýrukdan soň cart arassalanýar
      set({ cart: [] });

      console.log(`✅ [Provider] Order created successfully:`, result);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      console.error("❌ [Provider] Failed to place order:", errorMessage);
      set({ cartError: errorMessage });
      throw error;
    } finally {
      set({ cartLoading: false });
    }
  },
}));