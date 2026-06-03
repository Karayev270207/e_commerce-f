import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../pool";

export const deleteCartItem = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;
        const customer_id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "Cart item ID is required" });
        }

        if (!customer_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Delete only if cart item belongs to the authenticated user
        const result = await pool.query(
            "DELETE FROM cart WHERE id = $1 AND customer_id = $2 RETURNING *",
            [id, customer_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found or unauthorized" });
        }

        console.log(`✅ [Cart] Deleted cart item ${id} for customer ${customer_id}`);
        return res.json({ message: "Cart item deleted successfully" });
    } catch (err) {
        console.error("❌ [Delete Cart Item] Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
