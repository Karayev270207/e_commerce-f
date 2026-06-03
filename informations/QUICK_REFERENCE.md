# Quick Reference Guide - E-Commerce API

## 🚀 Common Tasks

### Fetch All Products
```typescript
import { useApiCreate } from './informations/providerData';

export function ProductList() {
  const { products, loading, error } = useApiCreate();
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Add Product to Cart
```typescript
const { cart, addToCart } = useApiCreate();

const handleAddToCart = (product: Product) => {
  addToCart(product); // Adds to cart with quantity 1
  console.log('📦 Product added to cart:', product.name);
};
```

### Login User
```typescript
import { useLogin } from './informations/loginContext';

export function LoginScreen() {
  const { login } = useLogin();
  
  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('✅ Login successful');
      // Navigate to home
    } else {
      console.log('❌ Login failed:', result.error);
    }
  };
  
  return <Button title="Login" onPress={handleLogin} />;
}
```

### Register New User
```typescript
const { register } = useLogin();

const handleRegister = async () => {
  const result = await register({
    email: 'newuser@example.com',
    password: 'password123',
    username: 'newuser',
  });
  
  if (result.success) {
    console.log('✅ Registration successful');
  } else {
    console.log('❌ Registration failed:', result.error);
  }
};
```

### Create New Product (Admin)
```typescript
import { addProduct } from './informations/apiPort';

const handleCreateProduct = async () => {
  try {
    const newProduct = {
      name: 'New Product',
      price: 99.99,
      category: 'Electronics',
      image: 'https://example.com/image.jpg',
      stock: 50,
    };
    
    const result = await addProduct(newProduct);
    console.log('✅ Product created:', result);
  } catch (error) {
    console.error('❌ Failed to create product:', error);
  }
};
```

### Fetch Customer Orders
```typescript
import { getOrders } from './informations/apiPort';

const handleFetchOrders = async (customerId: number) => {
  try {
    const orders = await getOrders(customerId);
    console.log('✅ Orders fetched:', orders);
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
  }
};
```

### Create Order from Cart
```typescript
import { createOrder } from './informations/apiPort';

const handleCreateOrder = async (cartId: number) => {
  try {
    const order = await createOrder(cartId);
    console.log('✅ Order created:', order);
  } catch (error) {
    console.error('❌ Failed to create order:', error);
  }
};
```

### Update Product
```typescript
import { updateProduct } from './informations/apiPort';

const handleUpdateProduct = async (productId: number) => {
  try {
    const updated = await updateProduct(productId, {
      name: 'Updated Name',
      price: 49.99,
    });
    console.log('✅ Product updated:', updated);
  } catch (error) {
    console.error('❌ Failed to update product:', error);
  }
};
```

### Delete Product
```typescript
import { deleteProduct } from './informations/apiPort';

const handleDeleteProduct = async (productId: number) => {
  try {
    await deleteProduct(productId);
    console.log('✅ Product deleted');
  } catch (error) {
    console.error('❌ Failed to delete product:', error);
  }
};
```

---

## 🛒 Cart Operations

### Add Item to Cart
```typescript
const { addToCart } = useApiCreate();

addToCart(product); // quantity = 1
```

### Increase Quantity
```typescript
const { cart, addToCart } = useApiCreate();

const cartItem = cart.find(item => item.id === productId);
if (cartItem) {
  // Add same product again to increase quantity
  addToCart(cartItem);
}
```

### Decrease Quantity
```typescript
const { minusCart } = useApiCreate();

minusCart(cartItem); // Decreases by 1
```

### Remove Item
```typescript
const { removeCart } = useApiCreate();

removeCart(productId);
```

### Clear Cart
```typescript
const { clearCart } = useApiCreate();

clearCart(); // Empties entire cart
```

---

## 📊 Category Operations

### Fetch All Categories
```typescript
import { getCategories } from './informations/apiPort';

const categories = await getCategories();
```

### Fetch Single Category
```typescript
import { getCategoryById } from './informations/apiPort';

const category = await getCategoryById(1);
```

### Create Category
```typescript
import { addCategory } from './informations/apiPort';

const newCategory = await addCategory({
  category_name: 'Electronics',
});
```

### Update Category
```typescript
import { updateCategory } from './informations/apiPort';

const updated = await updateCategory(1, {
  category_name: 'Updated Name',
});
```

### Delete Category
```typescript
import { deleteCategory } from './informations/apiPort';

await deleteCategory(1);
```

---

## 🏷️ Brand Operations

### Fetch All Brands
```typescript
import { getBrands } from './informations/apiPort';

const brands = await getBrands();
```

### Fetch Single Brand
```typescript
import { getBrandById } from './informations/apiPort';

const brand = await getBrandById(1);
```

### Create Brand
```typescript
import { addBrand } from './informations/apiPort';

const newBrand = await addBrand({
  brand_name: 'Samsung',
});
```

### Update Brand
```typescript
import { updateBrand } from './informations/apiPort';

const updated = await updateBrand(1, {
  brand_name: 'Updated Brand',
});
```

### Delete Brand
```typescript
import { deleteBrand } from './informations/apiPort';

await deleteBrand(1);
```

---

## 👤 Customer Operations

### Fetch All Customers
```typescript
import { getCustomers } from './informations/apiPort';

const customers = await getCustomers();
```

### Fetch Single Customer
```typescript
import { getCustomerById } from './informations/apiPort';

const customer = await getCustomerById(1);
```

### Edit Customer
```typescript
import { editCustomer } from './informations/apiPort';

const updated = await editCustomer(1, {
  username: 'newusername',
  surname: 'newsurname',
});
```

---

## 🛍️ Detailed API Calls

### Add to Server Cart
```typescript
import { addToCartAPI } from './informations/apiPort';

await addToCartAPI(
  customerId,    // Customer ID
  productId,     // Product ID
  quantity       // Quantity (e.g., 2)
);
```

### Update Cart Item
```typescript
import { updateCartItem } from './informations/apiPort';

await updateCartItem(
  cartItemId,  // Item ID in cart
  newQuantity  // New quantity
);
```

### Delete Cart Item
```typescript
import { deleteCartItem } from './informations/apiPort';

await deleteCartItem(cartItemId);
```

### Get Customer Cart
```typescript
import { getCart } from './informations/apiPort';

const cart = await getCart(customerId);
```

---

## 📦 Order Operations

### Get Customer Orders
```typescript
import { getOrders } from './informations/apiPort';

const orders = await getOrders(customerId);
```

### Get Single Order
```typescript
import { getOrderById } from './informations/apiPort';

const order = await getOrderById(orderId);
```

### Create Order
```typescript
import { createOrder } from './informations/apiPort';

const order = await createOrder(cartId);
```

### Update Order Status
```typescript
import { updateOrder } from './informations/apiPort';

await updateOrder(orderId, 'shipped');
// Status examples: 'pending', 'shipped', 'delivered', 'cancelled'
```

### Delete Order
```typescript
import { deleteOrder } from './informations/apiPort';

await deleteOrder(orderId);
```

---

## 🔐 Authentication

### Login
```typescript
const { login } = useLogin();

const result = await login('email@example.com', 'password');
if (result.success) {
  // User logged in
  // User data stored in AsyncStorage
}
```

### Register
```typescript
const { register } = useLogin();

const result = await register({
  email: 'new@example.com',
  password: 'password123',
  username: 'johndoe',
  surname: 'doe',
});
```

### Logout
```typescript
const { logout } = useLogin();

await logout();
// User removed from AsyncStorage
// App state cleared
```

### Get Current User
```typescript
const { users } = useLogin();

console.log('Current user:', users);
// Returns TypeCustomer object or null
```

### Check Loading State
```typescript
const { isLoading } = useLogin();

if (isLoading) {
  return <ActivityIndicator />;
}
```

---

## 🐛 Console Output Examples

### Successful Request
```
📤 [API Request] GET /api/products
   data: undefined, params: undefined
✅ [API Response] GET /api/products
   status: 200, data: [...]
✅ [Products] Fetched successfully: [...]
```

### Failed Request
```
📤 [API Request] POST /api/customers/login
   data: {email: "...", password: "..."}
❌ [API Response Error] 401
   url: /api/customers/login
   status: 401
   message: "Invalid credentials"
❌ [Login] Authentication failed: [Error]
```

### Network Error
```
❌ [API Request Error - No Response]
   url: /api/products
   message: "Network Error"
```

---

## ⚠️ Error Handling

### Wrap in Try-Catch
```typescript
try {
  const products = await getProducts();
  console.log(products);
} catch (error) {
  const msg = error instanceof Error ? error.message : 'Unknown error';
  console.error('Failed:', msg);
  // Show error to user
}
```

### Handle in useEffect
```typescript
useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      const data = await getProducts();
      if (mounted) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
      if (mounted) {
        setError(error.message);
      }
    }
  })();

  return () => {
    mounted = false;
  };
}, []);
```

---

## 💡 Pro Tips

1. **Check Console First** - Most errors are logged in console with context
2. **Use Emoji Filters** - Filter console by emoji (✅, ❌, 🔄) for specific types
3. **Inspect Network Tab** - Use Chrome DevTools Network tab to see actual HTTP requests
4. **Verify Environment** - Check `.env` file has correct `EXPO_PUBLIC_API_URL`
5. **Use Separate Instances** - Each context (LoginProvider, ApiCreateProvider) is independent
6. **Check Types** - TypeScript will catch most API response type mismatches
7. **Monitor Loading** - Always check `loading` state before rendering
8. **Handle Errors** - Always include error handling in try-catch blocks

---

## 🔗 Related Files

- `API_DOCUMENTATION.md` - Complete API reference
- `IMPROVEMENTS_SUMMARY.md` - What changed and why
- `types.ts` - TypeScript type definitions
- `apiAxios.tsx` - Axios configuration
- `apiPort.tsx` - All API functions
- `providerData.tsx` - Products/Categories context
- `loginContext.tsx` - Authentication context

---

**Last Updated:** May 31, 2026
