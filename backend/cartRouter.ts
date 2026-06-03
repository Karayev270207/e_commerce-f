import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { deleteCartItem } from "./cart/deleteCart";
import { getAllCartItems } from "./cart/getCart";
import { getCartByCustomerId } from "./cart/getCartParams";
import { addToCart } from "./cart/postCart";

const router = Router();

// Protected routes - require authentication
router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getAllCartItems);
router.get("/:id", authMiddleware, getCartByCustomerId);
router.delete("/:id", authMiddleware, deleteCartItem);

export default router;
