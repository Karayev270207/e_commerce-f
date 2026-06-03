import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../pool";

export const getAllCartItems = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const customer_id = req.user?.id;

        if (!customer_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get only the authenticated user's cart items
        const result = await pool.query(
            "SELECT * FROM cart WHERE customer_id = $1 ORDER BY id ASC",
            [customer_id]
        );

        console.log(`✅ [Cart] Retrieved ${result.rows.length} items for customer ${customer_id}`);
        return res.json({
            message: "Cart items retrieved successfully",
            cartItems: result.rows
        });
    } catch (err) {
        console.error("❌ [Get Cart Items] Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
