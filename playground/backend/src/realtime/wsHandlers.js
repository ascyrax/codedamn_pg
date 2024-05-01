import jwt from "jsonwebtoken";
import {
  startContainer,
  docker,
} from "../api/controllers/terminalController.js";

// const clients = new Map(); // not usefule anymore

export async function handleNewWSConnection(ws, req) {
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
//   clients[currentUsername] = ws;
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
        if (execStream.writable) {
          execStream.write(xtermCommand + "\r");
        }
      });

      // Create a promise to handle the output
      let data = "";

      execStream.on("data", async (chunk) => {
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
    ws.close();
    console.error(":( error in startContainer", err);
  }

  ws.on("close", () => {
    console.log("Client disconnected from the WebSocket Server");
  });
}

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
