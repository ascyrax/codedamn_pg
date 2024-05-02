import { URL } from "url";
import {
  startContainer,
  docker,
} from "../api/controllers/terminalController.js";

export async function handleNewWSConnection(ws, req) {
  console.log("Client connected to the WebSocket Server");
  let currentUsername = "";
  const queryParams = new URL(req.url, `http://${req.headers.host}`)
    .searchParams;
  const username = queryParams.get("username");
  if (username) currentUsername = username;

  try {
    let container = await startContainer(currentUsername);
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
      ws.on("message", async (message) => {
        if (execStream.writable) {
          execStream.write(message + "\r");
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

      return container, execStream;

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
