import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import {
  startContainer,
  executeCommand,
  docker,
} from "./api/controllers/terminalController.js";

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
wss.on("connection", async (ws) => {
  console.log("Client connected to the WebSocket Server");
  let container;

  try {
    container = await startContainer();
    const execOptions = {
      Cmd: ["bash"], // Command to start bash
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true, // This allocates a pseudo-TTY, important for interactive shells
    };

    try {
      const exec = await container.exec(execOptions);
      const execStream = await exec.start({
        hijack: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      // Relay output from the Docker exec to the WebSocket client
      docker.modem.demuxStream(execStream, process.stdout, process.stderr);

      ws.on("message", async (xtermCommand) => {
        console.log(`ws received: ${xtermCommand}`);
        ws.send(`Server received: ${xtermCommand}`);
        if (execStream.writable) {
          execStream.write(xtermCommand + "\r");
        }
      });

      // Create a promise to handle the output
      let data = "";

      execStream.on("data", (chunk) => {
        data += chunk.toString();
      });

      // Handle stream close/error
      execStream.on("close", () => {
        console.log("Stream closed");
        ws.close();
      });
      execStream.on("error", (err) => {
        console.error("Stream error:", err);
        ws.terminate();
      });

      ws.on("close", () => {
        console.log("WebSocket closed");
        execStream.end();
      });

      // Optionally handle stdout and stderr separately if needed
      // docker.modem.demuxStream(stream, process.stdout, process.stderr);
    } catch (error) {
      console.error("Error executing interactive command:", error);
      ws.send("Error: " + error.message);
      ws.close();
    }
  } catch (err) {
    console.error(":( error in startContainer", err);
  }

  ws.on("close", () => {
    console.log("Client disconnected from the WebSocket Server");
  });
});

// Listen on HTTP and WebSocket on the same port
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export { app, wss };
