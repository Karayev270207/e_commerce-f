import api from "./apiAxios";
import {
  CartItem,
  PostProduct,
  Product,
  TypeBrand,
  TypeCategory,
  TypeCommerceArea,
  TypeCustomer,
} from "./types";

// ─── Customers ───
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
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
    const raw: any[] = res.data?.products || res.data;
    return raw.map((p) => ({
      ...p,
      name: p.name ?? "",
      category: p.category ?? "",
      image: p.image ?? p.main_image_url ?? null,
    }));
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

// ─── Image upload helper (reused by product and commerce area functions) ───

function buildImageFormData(
  imageUri: string,
  fields: Record<string, string>
): FormData {
  const filename = imageUri.split("/").pop() ?? "image.jpg";
  const ext = (/\.(\w+)$/.exec(filename)?.[1] ?? "jpg").toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", heic: "image/heic",
  };
  const formData = new FormData();
  formData.append("image", { uri: imageUri, name: filename, type: mimeTypes[ext] ?? "image/jpeg" } as any);
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  // console.log('field:',fields);
  // console.log(formData);
  return formData;
}

export const addProduct = async (product: PostProduct) => {
  try {
    let res: {data:any} = {data: null};
    if (product.imageUri) {
      const formData = buildImageFormData(product.imageUri, {
        name:  product.name,
        price: String(product.price),
        stock: String(product.stock ?? 0),
        description: product.description ?? "",
        ...(product.category_id      != null ? { category_id:      String(product.category_id) }      : {}),
        ...(product.brand_id         != null ? { brand_id:         String(product.brand_id) }         : {}),
        ...(product.commerce_area_id != null ? { commerce_area_id: String(product.commerce_area_id) } : {}),
      });
      console.log("🔄 [Add Product] Creating product with image...", {
        name: product.name,
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        brand_id: product.brand_id,
        commerce_area_id: product.commerce_area_id,
      });
      // No explicit Content-Type: the request interceptor strips it so RN's native XHR
      // can set multipart/form-data with the correct boundary automatically.
      const response = await fetch(`${BASE_URL}/api/products`,{
        method:"POST",
        body:formData,
      });
      const data = await response.json();
      if(!response.ok) {
        throw new Error(`Server errory: ${response.status}. ${JSON.stringify(data)}`);
      }
      res.data = data;
    } else {
      console.log("🔄 [Add Product] Creating product...");
      res = await api.post("/products", {
        name:            product.name,
        price:           product.price,
        stock:           product.stock ?? 0,
        description:     product.description ?? "",
        category_id:     product.category_id     ?? null,
        brand_id:        product.brand_id         ?? null,
        commerce_area_id: product.commerce_area_id ?? null,
      });
    }

    console.log("✅ [Add Product] Product created:", res.data);
    return res.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message ?? error?.message ?? "Failed to create product";
    console.error("❌ [Add Product] Failed:", msg);
    throw new Error(msg);
  }
};

export const updateProduct = async (
  id: number,
  product: Partial<PostProduct>,
) => {
  try {
    console.log(`🔄 [Update Product] Updating product ${id}...`);
    let body;
    const headers: Record<string, string> = {};
    if (product.imageUri) {
      const fields: Record<string, string> = {};
      if (product.name        !== undefined) fields.name        = product.name;
      if (product.price       !== undefined) fields.price       = String(product.price);
      if (product.stock       !== undefined) fields.stock       = String(product.stock);
      if (product.description !== undefined) fields.description = product.description;
      if (product.category_id      != null)  fields.category_id      = String(product.category_id);
      if (product.brand_id         != null)  fields.brand_id         = String(product.brand_id);
      if (product.commerce_area_id != null)  fields.commerce_area_id = String(product.commerce_area_id);
      body = buildImageFormData(product.imageUri, fields);
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(product);
    }
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
      method: "PATCH",
      headers,
      body,
    });
    if(!response.ok){
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`Product [${data}] updated successfully!`);
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
    const res = await fetch(`${BASE_URL}/api/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    const data = await res.json();
    console.log("✅ [Add Brand] Brand created successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ [Add Brand] Failed to create brand:", error);
    throw error;
  }
};

export const updateBrand = async (id: number, brand: Partial<TypeBrand>) => {
  try {
    console.log(`🔄 [Update Brand] Updating brand ${id}...`, brand);
    const res = await fetch(`${BASE_URL}/api/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    const data = await res.json();
    console.log(`✅ [Update Brand] Brand ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`❌ [Update Brand] Failed to update brand ${id}:`, error);
    throw error;
  }
};

export const deleteBrand = async (id: number) => {
  try {
    console.log(`🔄 [Delete Brand] Deleting brand ${id}...`);
    const res = await fetch(`${BASE_URL}/api/brands/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    console.log(`✅ [Delete Brand] Brand ${id} deleted successfully:`, data);
    return data;
  } catch (error) {
    console.error(`❌ [Delete Brand] Failed to delete brand ${id}:`, error);
    throw error;
  }
};

export const addToCartAPI = async (
  customerId: number,
  productId: number,
  quantity: number
) => {
  try {
    console.log(
      `🔄 [Add to Cart] Adding product ${productId} (qty: ${quantity}) to cart...`
    );
    const res = await api.post("/cart", {
      customer_id: customerId,
      product_id: productId,
      quantity,
    });
    console.log("✅ [Add to Cart] Item added successfully:", res.data);
    return res.data?.data || res.data?.cartItem || res.data;
  } catch (error) {
    console.error("❌ [Add to Cart] Failed to add item to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (id: number, quantity: number) => {
  try {
    console.log(`🔄 [Update Cart] Setting cart item ${id} quantity to ${quantity}...`);
    const res = await api.put("/cart", { cart_id: id, quantity });
    console.log(`✅ [Update Cart] Cart item ${id} updated:`, res.data);
    return res.data;
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

export const getOrders = async (customerId?: number) => {
  try {
    console.log(`🔄 [Orders] Fetching orders...`);
    const url = customerId ? `/orders?customer_id=${customerId}` : `/orders`;
    const res = await api.get(url);
    console.log(`✅ [Orders] Orders fetched:`, res.data);
    return res.data?.orders || res.data;
  } catch (error) {
    console.error(`❌ [Orders] Failed to fetch orders:`, error);
    throw error;
  }
};

export const createOrder = async (cartId: number, phone: string, address: string, totalPrice: number) => {
  try {
    console.log(`🔄 [Create Order] Creating order...`);
    const res = await api.post("/orders", { cart_id: cartId, phone, address, total_price: totalPrice });
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

// GET /api/cart?customer_id=...
export const getCart = async (customerId: number): Promise<CartItem[]> => {
  const { data } = await api.get(`/cart?customer_id=${customerId}`);
  return data.cartItems;
};

// GET /api/cart/:id
export const getCartById = async (id: number): Promise<CartItem> => {
  const { data } = await api.get(`/cart/${id}`);
  return data.cartItem;
};

// ─── Commerce Areas ───

export const getCommerceAreas = async (): Promise<TypeCommerceArea[]> => {
  try {
    console.log("🔄 [CommerceAreas] Fetching all commerce areas...");
    const res = await api.get("/commerce-areas");
    console.log("✅ [CommerceAreas] Fetched:", res.data);
    return res.data?.commerce_areas || res.data;
  } catch (error) {
    console.error("❌ [CommerceAreas] Failed to fetch:", error);
    throw error;
  }
};

export const getCommerceAreaByIdAPI = async (id: number): Promise<TypeCommerceArea> => {
  try {
    const res = await api.get(`/commerce-areas/${id}`);
    return res.data?.commerce_area || res.data;
  } catch (error) {
    console.error(`❌ [CommerceArea] Failed to fetch area ${id}:`, error);
    throw error;
  }
};

export const createCommerceAreaAPI = async (data: {
  customer_id: number;
  area_name: string;
  description?: string;
  imageUri?: string;
}) => {
  try {
    console.log("🔄 [CommerceArea] Creating commerce area...");
    let res: any;

    if (data.imageUri) {
      const formData = buildImageFormData(data.imageUri, {
        customer_id: String(data.customer_id),
        area_name:   data.area_name,
        ...(data.description ? { description: data.description } : {}),
      });
      res = await fetch(`${BASE_URL}/api/commerce-areas`, {
        method: "POST",
        body: formData,
      });
    } else {
      res = await fetch(`${BASE_URL}/api/commerce-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: data.customer_id,
          area_name:   data.area_name,
          description: data.description ?? null,
        }),
      });
    }
    const result = await res.json();
    if (!res.ok) throw new Error(result?.message ?? `Server error ${res.status}`);
    console.log("✅ [CommerceArea] Created:", result);
    return result;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || "Failed to create commerce area";
    console.error("❌ [CommerceArea] Failed to create:", msg);
    throw new Error(msg);
  }
};

export const updateCommerceAreaAPI = async (
  id: number,
  data: { area_name?: string; description?: string; is_active?: boolean; imageUri?: string },
) => {
  try {
    console.log(`🔄 [CommerceArea] Updating area ${id}...`);
    let res: any;

    if (data.imageUri) {
      const fields: Record<string, string> = {};
      if (data.area_name   !== undefined) fields.area_name   = data.area_name;
      if (data.description !== undefined) fields.description = data.description;
      if (data.is_active   !== undefined) fields.is_active   = String(data.is_active);
      const formData = buildImageFormData(data.imageUri, fields);
      res = await fetch(`${BASE_URL}/api/commerce-areas/${id}`, {
        method: "PATCH",
        body: formData,
      });
    } else {
      res = await fetch(`${BASE_URL}/api/commerce-areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_name:   data.area_name,
          description: data.description,
          is_active:   data.is_active,
        }),
      });
    }

    const result = await res.json();
    if (!res.ok) throw new Error(result?.message ?? `Server error ${res.status}`);
    console.log("✅ [CommerceArea] Updated:", result);
    return result;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || "Failed to update";
    console.error("❌ [CommerceArea] Failed to update:", msg);
    throw new Error(msg);
  }
};

export const deleteCommerceAreaAPI = async (id: number) => {
  try {
    console.log(`🔄 [CommerceArea] Deleting area ${id}...`);
    const res = await api.delete(`/commerce-areas/${id}`);
    console.log("✅ [CommerceArea] Deleted:", res.data);
    return res.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || "Failed to delete";
    console.error("❌ [CommerceArea] Failed to delete:", msg);
    throw new Error(msg);
  }
};