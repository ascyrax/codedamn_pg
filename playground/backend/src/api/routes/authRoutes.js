import express from "express";
import { handleLogin, handleRegister } from "../controllers/authController.js";

const authRoutes = express.Router();

// app.use("/auth", authRoutes);

authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);

export { authRoutes };
