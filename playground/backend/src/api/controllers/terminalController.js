import * as os from "os";
import * as pty from "node-pty";
import * as Docker from "dockerode";

// dockerode
const docker = new Docker.default({ socketPath: "/var/run/docker.sock" });

// nodepty
// var shell = os.platform() === "win32" ? "powershell.exe" : "zsh";

// var ptyProcess = pty.spawn(shell, [], {
//   name: "codedamn",
//   cols: 100,
//   rows: 40,
//   // cwd: "./",
//   env: process.env,
// });
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

// Container options
const containerOptions = {
  Image: "ubuntu", // Specify the image name
  // Cmd: ["bash", "-c", 'while true; do echo "Hello, Dockerode!"; sleep 1; done'],
  Cmd: ["bash", "-c", "tail -f /dev/null"],
  name: "user01",
  AttachStdout: true, // Attach container's stdout to the Node.js process
  AttachStderr: true, // Attach container's stderr to the Node.js process
  Tty: true,
};

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

export function executeCommandInContainer(req, res) {
  let command = req.body.body || "ls -la";
  // let command = "ls -la";

  console.log(command);

  // execute in container
  let userContainerId = "user01"; // container corresponding to the user
  let container = docker.getContainer(userContainerId);

  executeCommand(container, command, (err, output) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send({ error: "Failed to execute command" });
    } 
    else {
      res.send({ output: output });
    }
  });
}

function executeCommand(container, command, callback) {
  container.exec(
    {
      Cmd: ["bash", "-c", command],
      AttachStdout: true,
      AttachStderr: true,
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

// function runCommandInNodepty(command) {
//   let ptyResponse = "";
//   ptyProcess.onData((data) => {
//     ptyResponse += data;
//   });

//   ptyProcess.write(command);
//   setTimeout(() => {
//     console.log(ptyResponse);
//     res.send(ptyResponse);
//   }, 1000);
// }
