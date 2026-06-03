import { Router } from "express";
import { createOrder } from "../controllers/orders/postOrders";
import { deleteOrder } from "../controllers/orders/deleteOrders";
import { getAllOrders } from "../controllers/orders/getOrders";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/", getAllOrders);
router.delete("/:id", deleteOrder);

export default router;
