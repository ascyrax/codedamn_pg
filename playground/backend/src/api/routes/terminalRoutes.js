import express from "express";
import { executeCommandInContainer } from "../controllers/terminalController.js";

const terminalRoutes = express.Router();

// app.use("/terminal", terminalRoutes);

terminalRoutes.post("/", executeCommandInContainer);

export { terminalRoutes };
