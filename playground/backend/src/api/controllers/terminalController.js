import * as Docker from "dockerode";
// import {wss} from "../../server.js";

// dockerode
const docker = new Docker.default({ socketPath: "/var/run/docker.sock" });

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

async function executeCommand(container, command) {
  const execOptions = {
    Cmd: ["bash", "-c", command],
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  };

  try {
    const exec = await container.exec(execOptions);
    const stream = await exec.start({ hijack: true, stdin: false });

    // // Collect output data from the stream
    // let output = "";

    // // Set up to receive output from the command
    //  stream.on("data",  (data) => {
    //   output += data.toString();
    //   console.log(output);
    // });

    // // Handle the end of the stream
    //  stream.on("end",  () => {
    //   console.log("Stream End: Command execution completed.[executeCommand]");
    //   return { err: null, output: output };
    // });

    // // Error handling
    // stream.on("error", (error) => {
    //   console.error("Error from exec stream:", error);
    // });

    // Create a promise to handle the output
    const output = await new Promise((resolve, reject) => {
      let data = "";

      stream.on("data", (chunk) => {
        data += chunk.toString();
      });

      stream.on("end", () => {
        console.log("Stream End: Command execution completed.");
        resolve(data);
      });

      stream.on("error", (error) => {
        console.error("Error from exec stream:", error);
        reject(error);
      });

      // Optionally handle stdout and stderr separately if needed
      // docker.modem.demuxStream(stream, process.stdout, process.stderr);
    });

    // Optionally, you might want to demux the stream if stdout and stderr need to be separated
    // docker.modem.demuxStream(stream, process.stdout, process.stderr);
    return { err: null, output: output };
  } catch (error) {
    console.error(":( Error executing command:", error);
    return { err: error, output: null };
  }
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

export async function executeCommandInContainer(command) {
  // console.log("command ----> ", command);
  // command = "ls";
  // execute in container
  let userContainerId = "user01"; // container corresponding to the user

  let container;
  try {
    container = await docker.getContainer(userContainerId);
  } catch (err) {
    console.log(
      ":( could not get the coontainer using docker.getContainer: ",
      err
    );
    res.status(500).send({ error: "Failed to execute command" });
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
      return err;
    }
  }

  // createInteractiveShell(container, userContainerId);

  let { err, output } = await executeCommand(container, command);
  if (err) {
    return { err: err, output: ":( command execution failed" };
  } else {
    return { err: null, output: output };
  }
}
