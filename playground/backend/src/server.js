import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { terminalRoutes } from "./api/routes/terminalRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import * as WebSocket from "ws";

console.log(WebSocket);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const wss = new WebSocket.WebSocket({ httpServer });

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use("/editordata", editorRoutes);
app.use("/terminal", terminalRoutes);

// Set up the WebSocket connection
wss.on("connection", (ws) => {
  console.log("Client connected to the WebSocket Server");

  // Echo received messages back to the client
  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Server received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected from the WebSocket Server");
  });
});

export { app, wss };
