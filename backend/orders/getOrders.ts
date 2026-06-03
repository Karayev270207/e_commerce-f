import { Request, Response } from "express";
import { pool } from "../../pool";

export const getAllOrders = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await pool.query("SELECT * FROM orders ORDER BY id ASC");

        return res.json({
            message: "Orders retrieved successfully",
            orders: result.rows
        });
    } catch (err) {
        console.error("Get Orders Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
