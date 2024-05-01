import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { authRoutes } from "./api/routes/authRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import {
  startContainer,
  docker,
} from "./api/controllers/terminalController.js";
import cookieParser from "cookie-parser";
import { isUserRegistered } from "./api/controllers/authController.js";
// import { updateEditorData } from "./api/controllers/editorController.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (true) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    // origin: "http://localhost:5173", // Specify the origin of the frontend
    credentials: true, // Allow cookies and authentication headers
    // methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  })
);
app.use(cookieParser());

const port = process.env.PORT || 3000;

connectDB();

function authenticateUsingCookies(req, res, next) {
  const username = req.cookies.username;
  const password = req.cookies.password;
  if (!username || !password) {
    res
      .status(400)
      .send({ success: false, msg: "invalid user. register / login please !" });
  }
  // const token = req.cookies.authToken; // Assumes cookie-parser is used and authToken cookie is set

  // if (!token) {
  //   return res.status(401).send("Access Denied: No token provided.");
  // }

  try {
    // const verified = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = verified; // Adding the verified user's data to the request object
    if (isUserRegistered({ username, password })) {
      next(); // Continue to the next middleware/route handler
    } else {
      res.status(400).send({
        success: false,
        msg: "invalid user. register / login please !",
      });
    }
  } catch (err) {
    res
      .status(400)
      .send({ success: false, msg: "invalid user. register / login please !" });
    // res.status(400).send("Invalid Token");
  }
}

app.use("/auth", authRoutes);
app.use(authenticateUsingCookies);
app.use("/editordata", editorRoutes);
// app.use("/terminal", terminalRoutes);

// web socket
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const clients = new Map();
wss.on("connection", handleNewClient);

export let currentUsername = "";
export function setCurrentUsername(username) {
  currentUsername = username;
}

async function handleNewClient(ws, req) {
  console.log("Client connected to the WebSocket Server");
  // console.log({req})
  // console.log(req.cookies.username);
  clients[currentUsername] = ws;
  let container;
  try {
    container = await startContainer(currentUsername);
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
      // docker.modem.demuxStream(execStream, process.stdout, process.stderr);
      docker.modem.demuxStream(
        execStream,
        {
          write: (chunk) => {
            ws.send(chunk.toString());
            process.stdout.write(chunk.toString());
          }, // Handle stdout
        },
        {
          write: (chunk) => {
            ws.send(chunk.toString()); // Handle stderr
            process.stderr.write(chunk.toString());
          },
        }
      );

      ws.on("message", async (xtermCommand) => {
        console.log(`ws received: ${xtermCommand}`);
        // ws.send(`Server received: ${xtermCommand}`);
        if (execStream.writable) {
          execStream.write(xtermCommand + "\r");
        }
      });

      // Create a promise to handle the output
      let data = "";

      execStream.on("data", async (chunk) => {
        data += chunk.toString();
        // await updateEditorData();
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
    ws.close();
    console.error(":( error in startContainer", err);
  }

  ws.on("close", () => {
    console.log("Client disconnected from the WebSocket Server");
  });
}

// Listen on HTTP and WebSocket on the same port
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export { app, wss };
