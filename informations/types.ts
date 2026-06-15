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
    image?: string | null;
    name: string;
    category: string;
    price: number;
    description?: string;
    stock?: number;
    brand_id?: number;
    category_id?: number;
    commerce_area_id?: number;
}

// ── Post Product (for creating a new product) ──
export interface PostProduct {
    imageUri?: string;  // local file URI for upload
    name: string;
    category: string;
    price: number;
    description?: string;
    stock?: number;
    brand_id?: number;
    category_id?: number;
    commerce_area_id?: number;
}

// ── Cart ──
export interface CartItem extends Product {
    id: number;
    cart_id?: number;
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
    total_price: number;
    phone: string;
    address: string;
    created_at?: string;
}

// ── Commerce Area ──
export interface TypeCommerceArea {
    id: number;
    customer_id: number;
    area_name: string;
    description?: string;
    image_url?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
