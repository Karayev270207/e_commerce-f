import { Request, Response } from "express";
import { pool } from "../../pool";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../../middlewares/generateAccessToken";

export const registerCustomer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, surname, email, user_pwd } = req.body;

        if (!username || !surname || !email || !user_pwd) {
            return res.status(400).json({ message: "Username, surname, email, password are required" });
        }

        const existingUser = await pool.query(
            "SELECT * FROM customers WHERE username = $1 OR surname = $2 OR email = $3",
            [username, surname, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user_pwd, saltRounds);

        const newUserResult = await pool.query(
            "INSERT INTO customers (username, surname, email, user_pwd) VALUES ($1, $2, $3, $4) RETURNING *",
            [username, surname, email, hashedPassword]
        );

        const user = newUserResult.rows[0];
        const token = generateAccessToken(user.id, user.email);
        console.log(token);
        return res.status(201).json({
            message: "User created successfully",
            accessToken: token,
            user: {
                id: user.id,
                phone: user.email
            }
        });
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const loginCustomer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, user_pwd } = req.body;

        if (!email || !user_pwd) {
            return res.status(400).json({ message: "Email and user password are required" });
        }

        const userResult = await pool.query(
            "SELECT * FROM customers WHERE email = $1",
            [email]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateAccessToken(user.id, user.email);

        console.log(token);
        return res.json({
            message: "Login success",
            accessToken: token
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
