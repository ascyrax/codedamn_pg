import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { terminalRoutes } from "./api/routes/terminalRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use("/editordata", editorRoutes);
app.use("/terminal", terminalRoutes);

export { app };
