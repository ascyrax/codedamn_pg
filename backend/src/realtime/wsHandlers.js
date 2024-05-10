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
    console.log("19 wsHandler.js");
    let container = await startContainer(currentUsername);
    console.log("21 wsHandler.js");
    watcher = await initWatcher(ws, volumeName);
    console.log("23 wsHanlder.js");
    const execOptions = {
      Cmd: ["bash"], // Command to start bash
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true, // This allocates a pseudo-TTY, important for interactive shells
    };

    const waitForStatus = async (status, maxRetries) => {
      let retries = 0;
      while (retries < maxRetries) {
        const info = await container.inspect();
        if (info.State.Status === status) {
          return { success: true, retries };
        }
        retries += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      }
      return { success: false };
    };

    try {
      let timeout = 10;
      let containerId = `cid_${currentUsername}`;
      console.log(`Waiting for container ${containerId} to start...`);
      const started = await waitForStatus("running", timeout);
      if (started.success) {
        console.log(
          `Container ${containerId} has started in ${started.retries}`
        );
      } else {
        console.error(
          `Timeout: Container ${containerId} failed to start within ${timeout} seconds.`
        );
        throw new Error(
          `Timeout: Container ${containerId} failed to start within ${timeout} seconds.`
        );
      }

      async function getExposedPort(containerName, containerPort) {
        try {
          // Retrieve the container instance
          const container = docker.getContainer(containerName);

          // Inspect the container to fetch port mappings
          const data = await container.inspect();

          // Retrieve the mapping of the specified container port
          const hostPortMapping =
            data.NetworkSettings.Ports[`${containerPort}/tcp`];

          // Check if there is a host port mapping
          if (hostPortMapping && hostPortMapping.length > 0) {
            const hostPort = hostPortMapping[0].HostPort;
            console.log(
              `Container Port ${containerPort} is mapped to Host Port ${hostPort}`
            );
            return hostPort;
          } else {
            console.log(`No mapping found for Container Port ${containerPort}`);
            return null;
          }
        } catch (error) {
          console.error("Error fetching port mappings:", error.message);
          return null;
        }
      }

      if (started.success) {
        let hostReactPort = await getExposedPort(containerId, 5173);
        let hostStaticPort = await getExposedPort(containerId, 1337);

        console.log("EXPOSED PORTS ------>>>> ", hostReactPort, hostStaticPort);
        let msg = {
          type:'exposedPorts',
          sender:'docker',
          hostReactPort,
          hostStaticPort,
          previewSrc:hostReactPort,
        };
        ws.send(JSON.stringify(msg));
      }

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
        watcher.close();
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
