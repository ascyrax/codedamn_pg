import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { executeCommandInContainer } from "./api/controllers/terminalController.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

connectDB();

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

app.use("/editordata", editorRoutes);
// app.use("/terminal", terminalRoutes);

// web socket

const httpServer = http.createServer(app);

const wss = new WebSocketServer({ server: httpServer });

// Set up the WebSocket connection
wss.on("connection", (ws) => {
  console.log("Client connected to the WebSocket Server");

  // Echo received messages back to the client
  ws.on("message", async (xtermCommand) => {
    console.log(`ws received: ${xtermCommand}`);
    ws.send(`Server received: ${xtermCommand}`);
    try {
      let result = await executeCommandInContainer(xtermCommand.toString());
      // console.log("result --------->  ", result);
      if (result) {
        if (result.err) {
          console.error(":( error executing the command", err);
          ws.send(err);
        } else if (result.output) {
          console.log("output -> ", result.output);
          ws.send(result.output);
        } else {
          console.log(":( empty output. command not valid");
          ws.send(":( empty output. command not valid");
        }
      }
    } catch (err) {
      console.error(":( error in executeCommandInContainer", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from the WebSocket Server");
  });
});

// Listen on HTTP and WebSocket on the same port
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export { app, wss };
