import express from "express";
import { runCommand } from "../controllers/terminalController.js";

const terminalRoutes = express.Router();

// app.use("/terminal", terminalRoutes);

terminalRoutes.post("/", runCommand);

export { terminalRoutes };
