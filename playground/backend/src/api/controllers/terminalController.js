import * as Docker from "dockerode";
// import {wss} from "../../server.js";

// dockerode
export const docker = new Docker.default({ socketPath: "/var/run/docker.sock" });

function createAndStartContainer(containerOptions) {
  // Create and start the container
  docker.createContainer(containerOptions, function (err, container) {
    if (err) {
      console.error("Error creating container:", err);
      return;
    }

    container.start(function (err) {
      if (err) {
        console.error("Error starting container:", err);
        return;
      }

      console.log("Container started successfully!");

      // Listen for container events
      container.wait(function (err, data) {
        if (err) {
          console.error("Error waiting for container:", err);
          return;
        }

        console.log("Container stopped:", data);
      });
    });
  });
}

export async function executeCommand(ws, container, command) {

}

async function isContainerRunning(container, userContainerId) {
  // check if the container is running or not
  try {
    const data = await container.inspect();

    // Check the state of the container
    if (data.State.Running) {
      // console.log(`The container '${userContainerId}' is running.`);
      return true;
    } else {
      // console.log(`The container '${userContainerId}' is not running.`);
      return false;
    }
  } catch (error) {
    console.error(
      `:( terminalController.js / isContainerRunning(): error trying to inspect the container ${userContainerId}`,
      error.message
    );
    return false;
  }
}

async function createInteractiveShell(container, containerName) {
  // const container = await docker.createContainer({
  //   Image: "ubuntu",
  //   Cmd: ["/bin/bash"],
  //   Tty: true,
  //   name: containerName,
  //   AttachStdout: true,
  //   AttachStderr: true,
  //   OpenStdin: true,
  // });

  // await container.start();

  const exec = await container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ["/bin/bash"],
  });

  const execStream = await exec.start({ hijack: true, stdin: true });
  process.stdin.pipe(execStream);
  execStream.pipe(process.stdout);

  execStream.on("end", () => {
    console.log("Stream ended");
    process.exit();
  });

  process.stdin.on("end", () => {
    console.log("STDIN ended");
    execStream.end();
  });

  process.stdin.setRawMode(true);
}

export async function startContainer() {
  let userContainerId = "user01"; // container corresponding to the user

  let container;
  try {
    container = await docker.getContainer(userContainerId);
  } catch (err) {
    console.log(
      ":( could not get the coontainer using docker.getContainer: ",
      err
    );
    return null;
  }

  // create the container if it doesn't exits
  // Container options
  const containerOptions = {
    Image: "ubuntu", // Specify the image name
    // Cmd: ["bash", "-c", 'while true; do echo "Hello, Dockerode!"; sleep 1; done'],
    Cmd: ["bash", "-c", "tail -f /dev/null"],
    name: userContainerId,
    AttachStdout: true, // Attach container's stdout to the Node.js process
    AttachStderr: true, // Attach container's stderr to the Node.js process
    Tty: true,
  };
  // createAndStartContainer(containerOptions);

  let isRunning = await isContainerRunning(container, userContainerId);

  // start the container if paused/stopped
  if (!isRunning) {
    try {
      await container.start();
      console.log(`The container '${userContainerId}' has been started.`);
    } catch (err) {
      console.log(
        `:( could not start the paused/stopped container ${userContainerId}`
      );
      return null;
    }
  }

  return container;
}
