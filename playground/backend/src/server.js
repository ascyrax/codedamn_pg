import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { terminalRoutes } from "./api/routes/terminalRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import * as os from "os";
import * as pty from "node-pty";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT | 3000;

connectDB();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use("/editordata", editorRoutes);
app.use("/terminal", terminalRoutes);

// nodepty
console.log(os.platform());
const shellProcess = os.platform() === "win32" ? "powershell.exe" : "bash";
console.log(shellProcess);
const ptyPocess = pty.spawn(shellProcess, [], {
  name: "codedamn-nodepty",
  cwd: process.env.PWD,
  env: process.env,
});
console.log(ptyPocess)

export { app, ptyPocess };
