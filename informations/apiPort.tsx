import api from "./apiAxios";
import {
  PostProduct,
  Product,
  TypeBrand,
  TypeCategory,
  TypeCustomer,
} from "./types";

// ─── Customers ───

export const loginCustomer = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    // Validate and clean credentials
    const email = credentials.email?.trim();
    const password = credentials.password?.trim();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Backend expects user_pwd field
    const cleanedCredentials = { email, user_pwd: password };
    console.log("🔐 [Login] Authenticating customer...", email);
    const res = await api.post("/customers/login", cleanedCredentials);
    console.log("✅ [Login] Authentication successful:", res.data);
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Login failed";
    console.error("❌ [Login] Authentication failed:", errorMessage);
    const err = new Error(errorMessage);
    throw err;
  }
};

export const getCustomers = async (): Promise<TypeCustomer[]> => {
  try {
    console.log("🔄 [Customers] Fetching all customers...");
    const res = await api.get("/customers");
    console.log("✅ [Customers] Fetched successfully:", res.data);
    return res.data?.customers || res.data;
  } catch (error) {
    console.error("❌ [Customers] Failed to fetch customers:", error);
    throw error;
  }
};

export const getCustomerById = async (id: number): Promise<TypeCustomer> => {
  try {
    console.log(`🔄 [Customer] Fetching customer with ID ${id}...`);
    const res = await api.get(`/customers/${id}`);
    console.log(`✅ [Customer] Fetched customer ${id} successfully:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ [Customer] Failed to fetch customer ${id}:`, error);
    throw error;
  }
};

export const registerCustomer = async (customer: Omit<TypeCustomer, "id">) => {
  try {
    // Validate and clean customer data
    const email = customer.email?.trim();
    const password = customer.password?.trim();
    const username = customer.username?.trim();
    const surname = customer.surname?.trim();

    // Validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (!username || !surname) {
      throw new Error("First name and last name are required");
    }

    // Backend expects user_pwd field
    const cleanedCustomer = {
      username,
      surname,
      email,
      user_pwd: password,
    };

    console.log("🔄 [Register] Registering new customer...", email);
    const res = await api.post("/customers/register", cleanedCustomer);
    console.log("✅ [Register] Customer registered successfully:", res.data);
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Registration failed";
    console.error("❌ [Register] Registration failed:", errorMessage);
    const err = new Error(errorMessage);
    throw err;
  }
};

export const editCustomer = async (id: number, data: Partial<TypeCustomer>) => {
  try {
    console.log(`🔄 [Update] Updating customer ${id}...`, data);
    const res = await api.put(`/customers/${id}`, data);
    console.log(`✅ [Update] Customer ${id} updated successfully:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ [Update] Failed to update customer ${id}:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    if (!id || id <= 0) {
      throw new Error("Invalid customer ID");
    }
    console.log(`🔄 [Delete] Deleting customer ${id}...`);
    const res = await api.delete(`/customers/${id}`);
    console.log(`✅ [Delete] Customer ${id} deleted successfully:`, res.data);
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Delete failed";
    console.error(`❌ [Delete] Failed to delete customer ${id}:`, errorMessage);
    const err = new Error(errorMessage);
    throw err;
  }
};

// ─── Products ───

export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("🔄 [Products] Fetching all products...");
    const res = await api.get("/products");
    console.log("✅ [Products] Fetched successfully:", res.data);
    return res.data?.products || res.data;
  } catch (error) {
    console.error("❌ [Products] Failed to fetch products:", error);
    throw error;
  }
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    console.log(`🔄 [Product] Fetching product with ID ${id}...`);
    const res = await api.get(`/products/${id}`);
    console.log(`✅ [Product] Fetched product ${id} successfully:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ [Product] Failed to fetch product ${id}:`, error);
    throw error;
  }
};

export const addProduct = async (product: PostProduct) => {
  try {
    console.log("🔄 [Add Product] Creating new product...", product);
    const res = await api.post("/products", product);
    console.log("✅ [Add Product] Product created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ [Add Product] Failed to create product:", error);
    throw error;
  }
};

export const updateProduct = async (
  id: number,
  product: Partial<PostProduct>,
) => {
  try {
    console.log(`🔄 [Update Product] Updating product ${id}...`, product);
    const res = await api.put(`/products/${id}`, product);
    console.log(
      `✅ [Update Product] Product ${id} updated successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(`❌ [Update Product] Failed to update product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    console.log(`🔄 [Delete Product] Deleting product ${id}...`);
    const res = await api.delete(`/products/${id}`);
    console.log(
      `✅ [Delete Product] Product ${id} deleted successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(`❌ [Delete Product] Failed to delete product ${id}:`, error);
    throw error;
  }
};

// ─── Categories ───

export const getCategories = async (): Promise<TypeCategory[]> => {
  try {
    console.log("🔄 [Categories] Fetching all categories...");
    const res = await api.get("/categories");
    console.log("✅ [Categories] Fetched successfully:", res.data);
    return res.data?.categories || res.data;
  } catch (error) {
    console.error("❌ [Categories] Failed to fetch categories:", error);
    throw error;
  }
};

export const getCategoryById = async (id: number): Promise<TypeCategory> => {
  try {
    console.log(`🔄 [Category] Fetching category with ID ${id}...`);
    const res = await api.get(`/categories/${id}`);
    console.log(`✅ [Category] Fetched category ${id} successfully:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ [Category] Failed to fetch category ${id}:`, error);
    throw error;
  }
};

export const addCategory = async (category: Omit<TypeCategory, "id">) => {
  try {
    console.log("🔄 [Add Category] Creating new category...", category);
    const res = await api.post("/categories", category);
    console.log("✅ [Add Category] Category created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ [Add Category] Failed to create category:", error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  category: Partial<TypeCategory>,
) => {
  try {
    console.log(`🔄 [Update Category] Updating category ${id}...`, category);
    const res = await api.put(`/categories/${id}`, category);
    console.log(
      `✅ [Update Category] Category ${id} updated successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(
      `❌ [Update Category] Failed to update category ${id}:`,
      error,
    );
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    console.log(`🔄 [Delete Category] Deleting category ${id}...`);
    const res = await api.delete(`/categories/${id}`);
    console.log(
      `✅ [Delete Category] Category ${id} deleted successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(
      `❌ [Delete Category] Failed to delete category ${id}:`,
      error,
    );
    throw error;
  }
};

// ─── Brands ───

export const getBrands = async (): Promise<TypeBrand[]> => {
  try {
    console.log("🔄 [Brands] Fetching all brands...");
    const res = await api.get("/brands");
    console.log("✅ [Brands] Fetched successfully:", res.data);
    return res.data?.brands || res.data;
  } catch (error) {
    console.error("❌ [Brands] Failed to fetch brands:", error);
    throw error;
  }
};

export const getBrandById = async (id: number): Promise<TypeBrand> => {
  try {
    console.log(`🔄 [Brand] Fetching brand with ID ${id}...`);
    const res = await api.get(`/brands/${id}`);
    console.log(`✅ [Brand] Fetched brand ${id} successfully:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ [Brand] Failed to fetch brand ${id}:`, error);
    throw error;
  }
};

export const addBrand = async (brand: Omit<TypeBrand, "id">) => {
  try {
    console.log("🔄 [Add Brand] Creating new brand...", brand);
    const res = await api.post("/brands", brand);
    console.log("✅ [Add Brand] Brand created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ [Add Brand] Failed to create brand:", error);
    throw error;
  }
};

export const updateBrand = async (id: number, brand: Partial<TypeBrand>) => {
  try {
    console.log(`🔄 [Update Brand] Updating brand ${id}...`, brand);
    const res = await api.put(`/brands/${id}`, brand);
    console.log(
      `✅ [Update Brand] Brand ${id} updated successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(`❌ [Update Brand] Failed to update brand ${id}:`, error);
    throw error;
  }
};

export const deleteBrand = async (id: number) => {
  try {
    console.log(`🔄 [Delete Brand] Deleting brand ${id}...`);
    const res = await api.delete(`/brands/${id}`);
    console.log(
      `✅ [Delete Brand] Brand ${id} deleted successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(`❌ [Delete Brand] Failed to delete brand ${id}:`, error);
    throw error;
  }
};

// ─── Cart (server-side) ───

export const getCart = async () => {
  try {
    console.log(`🔄 [Cart] Fetching cart for current customer...`);
    const res = await api.get(`/cart`);
    console.log(`✅ [Cart] Cart fetched successfully:`, res.data);
    return res.data?.cartItems || res.data;
  } catch (error) {
    console.error(`❌ [Cart] Failed to fetch cart:`, error);
    throw error;
  }
};

export const getCartByCustomerId = async (customerId: number) => {
  try {
    console.log(`🔄 [Cart] Fetching cart for customer ${customerId}...`);
    const res = await api.get(`/cart/${customerId}`);
    console.log(`✅ [Cart] Cart fetched for customer ${customerId}:`, res.data);
    return res.data?.cartItems || res.data;
  } catch (error) {
    console.error(
      `❌ [Cart] Failed to fetch cart for customer ${customerId}:`,
      error,
    );
    throw error;
  }
};

export const addToCartAPI = async (productId: number, quantity: number) => {
  try {
    console.log(
      `🔄 [Add to Cart] Adding product ${productId} (qty: ${quantity}) to cart...`,
    );
    const res = await api.post("/cart", {
      product_id: productId,
      quantity,
    });
    console.log("✅ [Add to Cart] Item added successfully:", res.data);
    return res.data?.cartItem || res.data;
  } catch (error) {
    console.error("❌ [Add to Cart] Failed to add item to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (id: number, quantity: number) => {
  try {
    // Backend doesn't support PUT for cart items
    // Solution: Delete and re-add with new quantity (requires product_id)
    console.log(
      `🔄 [Update Cart] Updating cart item ${id} with quantity ${quantity}...`,
    );
    console.warn(
      "⚠️  [Update Cart] Backend doesn't support PUT. Use deleteCartItem + addToCartAPI instead",
    );

    // For now, just delete the item
    await deleteCartItem(id);
    // The frontend should then re-add with addToCartAPI(productId, newQuantity)

    return { message: "Cart item deleted. Please re-add with new quantity." };
  } catch (error) {
    console.error(`❌ [Update Cart] Failed to update cart item ${id}:`, error);
    throw error;
  }
};

export const deleteCartItem = async (id: number) => {
  try {
    console.log(`🔄 [Delete Cart Item] Deleting cart item ${id}...`);
    const res = await api.delete(`/cart/${id}`);
    console.log(
      `✅ [Delete Cart Item] Cart item ${id} deleted successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(
      `❌ [Delete Cart Item] Failed to delete cart item ${id}:`,
      error,
    );
    throw error;
  }
};

// ─── Orders ───

export const getOrders = async () => {
  try {
    console.log(`🔄 [Orders] Fetching all orders...`);
    const res = await api.get(`/orders`);
    console.log(`✅ [Orders] Orders fetched successfully:`, res.data);
    return res.data?.orders || res.data;
  } catch (error) {
    console.error(`❌ [Orders] Failed to fetch orders:`, error);
    throw error;
  }
};

export const createOrder = async (cartId: number) => {
  try {
    console.log(`🔄 [Create Order] Creating order from cart ${cartId}...`);
    const res = await api.post("/orders", { cart_id: cartId });
    console.log("✅ [Create Order] Order created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ [Create Order] Failed to create order:", error);
    throw error;
  }
};

export const updateOrder = async (id: number, status: string) => {
  try {
    // Note: Backend doesn't currently support PUT for orders
    console.log(
      `🔄 [Update Order] Updating order ${id} status to ${status}...`,
    );
    console.warn(
      "⚠️  [Update Order] Backend doesn't support order updates yet",
    );
    // Implement when backend adds PUT /orders/:id support
    throw new Error("Order update not yet implemented in backend");
  } catch (error) {
    console.error(`❌ [Update Order] Failed to update order ${id}:`, error);
    throw error;
  }
};

export const deleteOrder = async (id: number) => {
  try {
    console.log(`🔄 [Delete Order] Deleting order ${id}...`);
    const res = await api.delete(`/orders/${id}`);
    console.log(
      `✅ [Delete Order] Order ${id} deleted successfully:`,
      res.data,
    );
    return res.data;
  } catch (error) {
    console.error(`❌ [Delete Order] Failed to delete order ${id}:`, error);
    throw error;
  }
};
