import express from "express";
import { editorRoutes } from "./api/routes/editorRoutes.js";
import { authRoutes } from "./api/routes/authRoutes.js";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import {
  startContainer,
  docker,
} from "./api/controllers/terminalController.js";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

// Middleware for verifying tokens
function authenticateToken(req, res, next) {
  let token = "";
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token == null)
    return res.status(401).json({
      success: false,
      msg: "authentication failed. send the jwt with requests OR login first if not done yet.",
    });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    req.username = user.userId;
    if (err)
      return res
        .status(403)
        .json({ success: false, msg: "authentication failed. invalid jwt" });
    next();
  });
}

app.use("/auth", authRoutes);
app.use(authenticateToken);
app.use("/editordata", editorRoutes);

// web socket
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const clients = new Map();

function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.match(/(.*?)=(.*)$/);
      cookies[parts[1].trim()] = (parts[2] || "").trim();
    });
  }
  console.log("parseCookies -> ", cookies);
  return cookies;
}

function authenticate(cookies, callback) {
  jwt.verify(cookies.token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      callback(new Error("Invalid token"), null);
      return;
    }
    console.log("authenticate -> ", user);
    callback(null, { username: user.userId }); // Simulated user
  });
}

// httpServer.on("upgrade", function upgrade(req, socket, head) {
//   console.log("upgrade -> ", head);
//   // This function parses cookies from the req headers
//   const cookies = parseCookies(req.headers.cookie);

//   // You can use these cookies to authenticate or manage sessions
//   // Here we simulate an authentication function
//   authenticate(cookies, (err, client) => {
//     if (err || !client) {
//       socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
//       socket.destroy();
//       return;
//     }
//     console.log("authenticate -> ", client);

//     wss.handleUpgrade(req, socket, head, function done(ws, req) {
//       console.log("wss.handleUpgrade callback -> ");
//       // Here we actually call the `connection` event of `ws`
//       wss.emit("connection", ws, req);
//     });
//   });
// });

wss.on("connection", handleNewClient);

async function handleNewClient(ws, req) {
  console.log("handleNewClient -> ", req.headers);
  const cookies = parseCookies(req.headers.cookie);
  let currentUsername = "";
  authenticate(cookies, (err, client) => {
    if (err || !client) {
      ws.send("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return;
    }
    console.log("authenticate -> ", client);
    currentUsername = client.username;
  });

  console.log("Client connected to the WebSocket Server");
  console.log("handleNewClient -> ", { currentUsername });
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
        console.log("handleNewClient -> ", { currentUsername });
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
