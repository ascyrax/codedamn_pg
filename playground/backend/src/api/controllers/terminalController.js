import * as Docker from "dockerode";
import fs from "fs/promises";
import path from "path";
// import {wss} from "../../server.js";

// dockerode
export const docker = new Docker.default({
  socketPath: "/var/run/docker.sock",
});

async function isContainerRunning(container, containerId) {
  // check if the container is running or not
  try {
    const data = await container.inspect();

    // Check the state of the container
    if (data.State.Running) {
      console.log(`The container '${containerId}' is running.`);
      return true;
    } else {
      console.log(`The container '${containerId}' is not running.`);
      return false;
    }
  } catch (error) {
    console.error(
      `:( terminalController.js / isContainerRunning(): error trying to inspect the container ${containerId}`,
      error.message
    );
    return false;
  }
}

async function copyDirectory(src, dest) {
  try {
    // Create the destination directory if it doesn't exist
    await fs.mkdir(dest, { recursive: true });

    // Read all files/directories from the source directory
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy directories
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy files
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error("Error copying directory:", error);
    throw error; // rethrow the error for caller to handle if necessary
  }
}

export async function createAndStartContainer(containerId) {
  const volumeName = "vid_" + containerId; // Name of the Docker volume

  // Container options
  const containerOptions = {
    Image: "user-ubuntu", // Specify the image name
    // Cmd: ["bash", "-c", 'while true; do echo "Hello, Dockerode!"; sleep 1; done'],
    Cmd: ["bash", "-c", "tail -f /dev/null"],
    name: containerId,
    AttachStdout: true, // Attach container's stdout to the Node.js process
    AttachStderr: true, // Attach container's stderr to the Node.js process
    Tty: true,
    // Volumes: {
    //   "/home/codedamn": {}, // Path where the volume will be mounted in the container
    // },
    HostConfig: {
      Binds: [`/var/tmp/codedamn/volumes/${volumeName}:/home/codedamn/`], // Bind the volume
    },
  };
  try {
    // Ensure the volume exists, or create it if it doesn't
    let volume = docker.getVolume(volumeName);
    let volumeInfo = await volume.inspect().catch(async () => {
      console.log(`Creating new volume: ${volumeName}`);
      // first populate the bind mount endpoint on the host with the necessary files
      const sourceDir = "/var/tmp/codedamn/volumes/vid_cid_"; // Set the source directory path
      const destinationDir = `/var/tmp/codedamn/volumes/${volumeName}`; // Set the destination directory path

      console.log(`Copying contents from ${sourceDir} to ${destinationDir}...`);
      await copyDirectory(sourceDir, destinationDir);
      console.log("Copy operation complete.");
      return await docker.createVolume({
        Name: volumeName,
      });
    });

    console.log(`Using volume: ${volumeInfo.name}`);
    // Create the container
    const container = await docker.createContainer(containerOptions);
    console.log("New container created with ID:", container.id);

    // Start the container
    await container.start();
    console.log("New container started successfully.");
  } catch (error) {
    console.error("Failed to create or start the container:", error.message);
  }
}

export async function startContainer(username) {
  let containerId = "cid_" + username; // container corresponding to the user

  let container;
  try {
    // Attempt to get the container with the given ID
    container = await docker.getContainer(containerId);

    // Check the container's status
    const data = await container.inspect();
    let status;
    if (data && data.State) status = data.State.Status;

    // If the container is stopped, start it
    if (status === "exited") {
      console.log("Container is stopped. Starting container...");
      await container.start();
      console.log("Container started successfully.");
    } else if (status === "running") {
      console.log("Container is already running.");
    }
  } catch (error) {
    // Error handling to check if the container does not exist
    if (error.statusCode === 404) {
      console.log("Container not found. Creating and starting a new one...");
      await createAndStartContainer(containerId);
    } else {
      console.error("An error occurred:", error.message);
    }
  }
  // console.log("container: ", container);

  return container;
}
