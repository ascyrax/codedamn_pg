import * as os from "os";
import * as pty from "node-pty";
import * as Docker from "dockerode";

// dockerode
const docker = new Docker.default({ socketPath: "/var/run/docker.sock" });

// docker.listContainers({ all: true }, function (err, containers) {
//   if (err) {
//     console.log("Error listing containers:", err);
//   } else {
//     console.log("List of containers:", containers);
//   }
// });

// docker.listImages({}, function (err, images) {
//   if (err) {
//     console.error("Error fetching images:", err);
//   } else {
//     console.log("All Docker Images:", images);
//   }
// });

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

function executeCommand(container, command, callback) {
  container.exec(
    {
      Cmd: ["bash", "-c", command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    },
    function (err, exec) {
      if (err) return callback(err);

      exec.start({ hijack: true, stdin: false }, function (err, stream) {
        if (err) return callback(err);

        // Dockerode may demultiplex the stream for you depending on the API version
        // you might want to handle stdout and stderr differently
        let output = "";

        stream.on("data", function (chunk) {
          output += chunk.toString();
        });

        stream.on("end", function () {
          callback(null, output);
        });

        // For error handling
        docker.modem.demuxStream(stream, process.stdout, process.stderr);
      });
    }
  );
}

async function isContainerRunning(container, userContainerId) {
  // check if the container is running or not
  try {
    const data = await container.inspect();
    // console.log(data);

    // Check the state of the container
    if (data.State.Running) {
      console.log(`The container '${userContainerId}' is running.`);
      return true;
    } else {
      console.log(`The container '${userContainerId}' is not running.`);
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

export async function executeCommandInContainer(req, res) {
  let command = req.body.body || "ls -la";
  // let command = "ls -la";

  console.log(command);

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
    }
  }

  createInteractiveShell(container, userContainerId);

  // executeCommand(container, command, (err, output) => {
  //   if (err) {
  //     console.error("Error:", err);
  //     res.status(500).send({ error: "Failed to execute command" });
  //   } else {
  //     res.send({ output: output });
  //   }
  // });
}
