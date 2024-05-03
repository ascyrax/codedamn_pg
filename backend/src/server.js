import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { authRoutes } from "./api/routes/authRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./middlewares/auth.js";
import { handleNewWSConnection } from "./realtime/wsHandlers.js";

const app = express();

dotenv.config();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://ec2-13-201-4-165.ap-south-1.compute.amazonaws.com/",
      "http://ec2-13-201-4-165.ap-south-1.compute.amazonaws.com:80/",
      "http://13.201.4.165/",
      "http://13.201.4.165:80/"
    ],
    credentials: true, // Allow cookies and authentication headers
  })
);
app.use(cookieParser());
const port = process.env.PORT || 3000;
connectDB();

app.use("/auth", authRoutes);

// authentication & authorization done here, before any protected routes are accessible to the user
app.use(authenticateToken);
app.use("/editordata", editorRoutes);

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// all user connections are containerized.
// xterm on the frontend is connected to the terminal running inside the corresponding docker container
wss.on("connection", handleNewWSConnection);

// Listen on HTTP and WebSocket on the same port
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export { app, wss };
