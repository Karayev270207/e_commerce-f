import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../pool";

export const getCartByCustomerId = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        // Use customer_id from authenticated user
        const customer_id = req.user?.id;

        if (!customer_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
            "SELECT * FROM cart WHERE customer_id = $1 ORDER BY id ASC",
            [customer_id]
        );

        console.log(`✅ [Cart] Retrieved cart for customer ${customer_id}: ${result.rows.length} items`);
        return res.json({
            message: "Customer cart retrieved successfully",
            cartItems: result.rows
        });
    } catch (err) {
        console.error("❌ [Get Cart By Customer ID] Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
