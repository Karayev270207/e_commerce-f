import { Request, Response } from "express";
import { pool } from "../../pool";

export const deleteOrder = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        const result = await pool.query(
            "DELETE FROM orders WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("Delete Order Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
