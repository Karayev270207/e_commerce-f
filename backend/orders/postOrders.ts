import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../pool";
interface TypeOrders extends Request {
    category_id:number;
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { cart_id,total_amount } = req.body;

        if (!cart_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // if (!total_amount || total_amount <= 0) {
        //     return res.status(400).json({ message: "Total amount is required and must be greater than 0" });
        // }

        const result = await pool.query(
            "INSERT INTO orders (cart_id) VALUES ($1) RETURNING *",
            [cart_id ]
        );

        const order = result.rows[0];

        return res.status(201).json({
            message: "Order created successfully",
            order: {
                id: order.id,
                cart_id: order.cart_id
            }
        });
    } catch (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
