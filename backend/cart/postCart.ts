import { Response } from "express";
import { pool } from "../../pool";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    // Get customer_id from authenticated user (set by authMiddleware)
    const customer_id = req.user?.id;
    const { product_id, quantity } = req.body;

    if (!customer_id) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    if (!product_id || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Product ID and positive quantity are required" });
    }

    const itemQuantity = parseInt(quantity) || 1;

    // Check if item already exists in cart
    const existingItem = await pool.query(
      "SELECT id, quantity FROM cart WHERE customer_id = $1 AND product_id = $2",
      [customer_id, product_id]
    );

    let cartItem;

    if (existingItem.rows.length > 0) {
      // Update existing cart item
      const newQuantity = existingItem.rows[0].quantity + itemQuantity;

      const result = await pool.query(
        "UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [newQuantity, existingItem.rows[0].id]
      );

      cartItem = result.rows[0];
      console.log(
        `✅ [Cart] Updated item ${product_id} for customer ${customer_id}`
      );
    } else {
      // Insert new cart item
      const result = await pool.query(
        "INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [customer_id, product_id, itemQuantity]
      );

      cartItem = result.rows[0];
      console.log(
        `✅ [Cart] Added item ${product_id} for customer ${customer_id}`
      );
    }

    return res.status(201).json({
      message: "Item added to cart successfully",
      cartItem: cartItem,
    });
  } catch (err) {
    console.error("❌ [Add to Cart] Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

    // Şowly tamamlandy jogaby
    return res.status(200).json({
      success: true,
      message: "Haryt sebede goşuldy",
      data: cartItem
    });

  } catch (error) {
    console.error("Cart error:", error);
    return res.status(500).json({ success: false, message: "Serwerde näsazlyk" });
  }
};