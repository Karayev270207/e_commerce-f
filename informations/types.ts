// ─── Consolidated Type Definitions ───

// ── Customer / Auth ──
export interface TypeCustomer {
    id?: number;
    email: string;
    password: string;
    username?: string;
    surname?: string;
}

// ── Product ──
export interface Product {
    id: number;
    image: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    stock?: number;
    brand_id?: number;
    category_id?: number;
}

export type PostProduct = Omit<Product, 'id'>;

// ── Cart ──
export interface CartItem extends Product {
    id: number;  // Database cart item ID
    customer_id: number;
    product_id: number;
    quantity: number;
}

// ── Category ──
export interface TypeCategory {
    id: number;
    category_name: string;
}

// ── Brand ──
export interface TypeBrand {
    id: number;
    brand_name: string;
}

// ── Order ──
export interface TypeOrder {
    id: number;
    cart_id: number;
    customer_id?: number;
    total?: number;
    status?: string;
    created_at?: string;
}