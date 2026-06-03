import { Router } from "express";
import { registerCustomer, loginCustomer } from "../controllers/customer/postUser";
import { deleteCustomer } from "../controllers/customer/deleteUser";
import { getAllCustomers } from "../controllers/customer/getCustomer";
import { getCustomerById } from "../controllers/customer/getCustomerParams";
import { authMiddleware } from "../middlewares/authMiddleware";
// import { postRegister } from "../controllers/customer/postUser";

const router = Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/", getAllCustomers);
router.delete("/:id", deleteCustomer);
router.get("/:id", getCustomerById);

export default router;
