import { URL } from "url";
import {
  startContainer,
  docker,
} from "../api/controllers/terminalController.js";
import { initWatcher } from "./chokidar.js";

export async function handleNewWSConnection(ws, req) {
  console.log("Client connected to the WebSocket Server");
  let currentUsername = "";
  const queryParams = new URL(req.url, `http://${req.headers.host}`)
    .searchParams;
  const username = queryParams.get("username");
  if (username) currentUsername = username;


  let volumeName = "vid_cid_" + currentUsername;
  let watcher;
  try {
    let container = await startContainer(currentUsername);

    watcher = await initWatcher(ws, volumeName);

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
            let msg = JSON.stringify({
              type: "stdout",
              description: "docker container's shell's stdout",
              sender: "docker",
              data: chunk.toString(),
            });
            ws.send(msg);
            process.stdout.write(chunk.toString());
          }, // Handle stdout
        },
        {
          write: (chunk) => {
            let msg = JSON.stringify({
              type: "stedrr",
              description: "docker container's shell's stderr",
              sender: "docker",
              data: chunk.toString(),
            });
            ws.send(msg);
            process.stderr.write(chunk.toString());
          },
        }
      );
      ws.on("message", async (msg) => {
        let parsedMsg = JSON.parse(msg);
        if (parsedMsg.type == "xterm") {
          // console.log("ws receive-> ", parsedMsg);
          if (execStream.writable) {
            execStream.write(parsedMsg.command + "\r");
          }
        }
      });

      // let data = "";

      // execStream.on("data", async (chunk) => {
      //   data += chunk.toString();
      // });

      // Handle stream close/error
      execStream.on("close", () => {
        console.log("Stream closed");
        watcher.close();
        ws.close();
      });

      execStream.on("error", (err) => {
        console.error("Stream error:", err);
        ws.send(
          "some error occured while executing the command in the container's terminal"
        );
        ws.terminate();
      });

      ws.on("close", () => {
        console.log("WebSocket closed");
        watcher.close()
        execStream.end();
      });

      return container, execStream;

      // Optionally handle stdout and stderr separately if needed
      // docker.modem.demuxStream(stream, process.stdout, process.stderr);
    } catch (error) {
      console.error("Error executing interactive command:", error);
      ws.send("Error: " + error.message);
      watcher.close();
      ws.close();
    }
  } catch (err) {
    watcher.close();
    ws.close();
    console.error(":( error in startContainer", err);
  }

  ws.on("close", () => {
    watcher.close();
    console.log("Client disconnected from the WebSocket Server");
  });
}
