import express from "express";
import { handleLogin, handleRegister } from "../controllers/authController.js";

const authRoutes = express.Router();

// url = /auth

authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);

export { authRoutes };
