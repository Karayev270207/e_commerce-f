# E-Commerce API Documentation

## Overview
This folder contains all the API integration, authentication, and data management utilities for the e-commerce application. The code has been refactored to use consistent error handling, comprehensive logging, and proper API organization.

---

## Files

### 1. **apiAxios.tsx** 
Central axios configuration with request/response interceptors.

**Features:**
- Base URL auto-configured from environment variables
- Request interceptor logs all outgoing requests with method, URL, data, and headers
- Response interceptor logs successful responses with status and data
- Comprehensive error logging for different error scenarios
- 10-second timeout for all requests

**Environment Variable:**
```
EXPO_PUBLIC_API_URL=http://your-api-url
```

**Example Console Output:**
```
📤 [API Request] GET /api/products
✅ [API Response] GET /api/products 
   status: 200, data: [...]
❌ [API Response Error] 404
```

---

### 2. **apiPort.tsx**
All API endpoint functions organized by resource.

#### **Authentication**
```typescript
loginCustomer({ email, password })  // Login user
```

#### **Customers**
```typescript
getCustomers()                       // Fetch all customers
getCustomerById(id)                  // Fetch single customer
registerCustomer(customer)           // Register new customer
editCustomer(id, data)               // Update customer
deleteCustomer(id)                   // Delete customer
```

#### **Products**
```typescript
getProducts()                        // Fetch all products
getProductById(id)                   // Fetch single product
addProduct(product)                  // Create product
updateProduct(id, product)           // Update product
deleteProduct(id)                    // Delete product
```

#### **Categories**
```typescript
getCategories()                      // Fetch all categories
getCategoryById(id)                  // Fetch single category
addCategory(category)                // Create category
updateCategory(id, category)         // Update category
deleteCategory(id)                   // Delete category
```

#### **Brands**
```typescript
getBrands()                          // Fetch all brands
getBrandById(id)                     // Fetch single brand
addBrand(brand)                      // Create brand
updateBrand(id, brand)               // Update brand
deleteBrand(id)                      // Delete brand
```

#### **Cart**
```typescript
getCart(customerId)                  // Fetch customer's cart
addToCartAPI(customerId, productId, quantity)  // Add item to cart
updateCartItem(id, quantity)         // Update cart item quantity
deleteCartItem(id)                   // Remove item from cart
```

#### **Orders**
```typescript
getOrders(customerId)                // Fetch customer's orders
getOrderById(id)                     // Fetch single order
createOrder(cartId)                  // Create order from cart
updateOrder(id, status)              // Update order status
deleteOrder(id)                      // Delete order
```

**Error Handling:**
All functions include try-catch blocks and throw errors for upstream handling.

**Logging:**
Each function logs:
- 🔄 Action start with parameters
- ✅ Success response with data
- ❌ Errors with full details

---

### 3. **loginContext.tsx**
Authentication context provider for managing user login/register/logout state.

**Features:**
- AsyncStorage persistence for user sessions
- Session restore on app launch
- Comprehensive error handling
- Detailed logging for all auth actions

**Context Methods:**
```typescript
login(email, password)               // Authenticate user
register(userData)                   // Register new user
logout()                             // Logout and clear session
```

**Usage:**
```typescript
import { useLogin } from './loginContext';

const { login, register, logout, users, isLoading } = useLogin();

// Login
const result = await login('user@email.com', 'password');
if (result.success) {
  // User logged in
}

// Register
const regResult = await register({ email: 'new@email.com', password: '123' });

// Logout
await logout();
```

---

### 4. **providerData.tsx**
Context provider for products, categories, and cart management.

**Features:**
- Fetches products and categories on app launch
- Cart state management (add, remove, update quantity)
- Error handling and loading states
- Uses apiPort functions for data fetching

**Context Methods:**
```typescript
addToCart(product)                   // Add product to cart
minusCart(cartItem)                  // Decrease quantity
removeCart(id)                       // Remove item from cart
clearCart()                          // Empty cart
postProduct(product)                 // Add new product
refreshProducts()                    // Refetch products & categories
```

**Usage:**
```typescript
import { useApiCreate } from './providerData';

const { products, categories, cart, addToCart, removeCart } = useApiCreate();
```

---

### 5. **types.ts**
TypeScript type definitions for all data models.

**Main Types:**
- `TypeCustomer` - User data (id, email, password, username, surname)
- `Product` - Product data with pricing and stock
- `TypeCategory` - Product category
- `TypeBrand` - Product brand
- `CartItem` - Product with quantity
- `TypeOrder` - Order information
- `PostProduct` - Create/Update product payload

---

## Console Logging Guide

The app includes detailed console logging with emojis for easy debugging:

| Emoji | Meaning |
|-------|---------|
| 📤 | API Request sent |
| ✅ | Successful operation |
| ❌ | Error occurred |
| 🔄 | Fetching data |
| 🔐 | Authentication action |
| 💾 | Saving/Storage action |
| ⚠️ | Warning (non-fatal) |
| ℹ️ | Info message |

---

## Error Handling

All functions properly handle and log errors:

```typescript
try {
  const data = await getProducts();
  console.log('Data:', data);
} catch (error) {
  console.error('Failed to fetch:', error);
  // Handle error appropriately
}
```

Error categories logged:
1. **Server Errors** (4xx, 5xx) - Full response details
2. **Network Errors** - Request made but no response
3. **Client Errors** - Request setup issues

---

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install axios @react-native-async-storage/async-storage
   ```

2. **Configure Environment:**
   Create `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://your-backend-api.com
   ```

3. **Wrap Providers:**
   ```typescript
   import { LoginProvider } from './informations/loginContext';
   import { ApiCreateProvider } from './informations/providerData';

   export default function App() {
     return (
       <LoginProvider>
         <ApiCreateProvider>
           {/* Your app components */}
         </ApiCreateProvider>
       </LoginProvider>
     );
   }
   ```

4. **Use Hooks:**
   ```typescript
   import { useLogin } from './informations/loginContext';
   import { useApiCreate } from './informations/providerData';

   export default function MyComponent() {
     const { products, categories, cart, addToCart } = useApiCreate();
     const { users, login, logout } = useLogin();
     
     // Use data...
   }
   ```

---

## API Endpoint Requirements

Your backend should have these endpoints:

### Authentication
- `POST /api/customers/login` - Login with email/password

### Customers
- `GET /api/customers` - List all
- `GET /api/customers/:id` - Get one
- `POST /api/customers` - Create
- `PUT /api/customers/:id` - Update
- `DELETE /api/customers/:id` - Delete

### Products
- `GET /api/products` - List all
- `GET /api/products/:id` - Get one
- `POST /api/products` - Create
- `PUT /api/products/:id` - Update
- `DELETE /api/products/:id` - Delete

### Categories
- `GET /api/categories` - List all
- `GET /api/categories/:id` - Get one
- `POST /api/categories` - Create
- `PUT /api/categories/:id` - Update
- `DELETE /api/categories/:id` - Delete

### Brands
- `GET /api/brands` - List all
- `GET /api/brands/:id` - Get one
- `POST /api/brands` - Create
- `PUT /api/brands/:id` - Update
- `DELETE /api/brands/:id` - Delete

### Cart
- `GET /api/cart?customer_id=:id` - Get customer's cart
- `POST /api/cart` - Add item
- `PUT /api/cart/:id` - Update item quantity
- `DELETE /api/cart/:id` - Remove item

### Orders
- `GET /api/orders?customer_id=:id` - Get customer's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

---

## Troubleshooting

**Problem:** "Network Error"
- **Solution:** Check `EXPO_PUBLIC_API_URL` is correct and backend is running

**Problem:** "Cannot fetch customers"
- **Solution:** Check console logs for exact error, ensure customer endpoint exists

**Problem:** "Session not persisting"
- **Solution:** Verify AsyncStorage is properly installed and configured

**Problem:** Missing data in logs
- **Solution:** Check browser/device console (Ctrl+J or device debugger)

---

## Recent Improvements ✨

✅ Added request/response interceptors with detailed logging
✅ Enhanced error handling throughout all functions
✅ Added missing CRUD operations for brands and customers
✅ Consolidated all API calls to use centralized `apiPort.tsx`
✅ Improved logging with emoji indicators
✅ Better TypeScript typing
✅ Consistent error messages and logging format
✅ Added `updateProduct`, `updateCategory`, `updateBrand`, `updateCartItem`, `updateOrder` functions
✅ Added `getProductById`, `getCategoryById`, `getBrandById`, `getOrderById` functions
✅ Added `loginCustomer` function to apiPort

---

## Contact & Support
For issues or questions about the API structure, check the console logs first for detailed error messages.
