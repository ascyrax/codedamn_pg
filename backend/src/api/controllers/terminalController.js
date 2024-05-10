import * as Docker from "dockerode";
import fs from "fs/promises";
import path from "path";

// dockerode
export const docker = new Docker.default({
  socketPath: "/var/run/docker.sock",
});

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
async function checkVolumeExists(volumeName) {
  try {
    const volumes = await docker.listVolumes();
    const volume = volumes.Volumes.find((vol) => vol.Name === volumeName);

    if (volume) {
      console.log(`Volume "${volumeName}" already exists.`);
      return true;
    } else {
      console.log(`Volume "${volumeName}" does not exist.`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking volume existence: ${error.message}`);
    return false;
  }
}

export async function createVolume(volumeName) {
  console.log("begin createVolume -> ", { volumeName });

  if (await checkVolumeExists(volumeName)) {
    return;
  }

  let volume, volumeInfo;
  try {
    // Ensure the volume exists, or create it if it doesn't
    volume = docker.getVolume(volumeName);
    volumeInfo = await volume.inspect().catch(async () => {
      console.log(`Creating new volume: ${volumeName}`);

      // first populate the bind mount endpoint on the host with the necessary files
      const sourceDir = "/var/tmp/codedamn/volumes/vid_cid_"; // Set the source directory path
      const destinationDir = `/var/tmp/codedamn/volumes/${volumeName}`; // Set the destination directory path

      console.log(`Copying contents from ${sourceDir} to ${destinationDir}...`);
      await copyDirectory(sourceDir, destinationDir);
      console.log("Copy operation complete.");

      await docker.createVolume({
        Name: volumeName,
      });
    });
    console.log(`Using volume: ${volumeInfo.name}`);
  } catch (err) {
    console.log("could not create a new volume.");
  }
  console.log("end createVolume -> ", { volumeName });
}

export async function createVolumeAndContainer(containerId) {
  console.log("begin createVolumeAndContainer -> ", { containerId });
  const volumeName = "vid_" + containerId; // Name of the Docker volume
  await createVolume(volumeName);
  const containerOptions = {
    Image: "user-ubuntu", // Specify the image name
    Cmd: ["bash", "-c", "tail -f /dev/null"],
    name: containerId,
    AttachStdout: true, // Attach container's stdout to the Node.js process
    AttachStderr: true, // Attach container's stderr to the Node.js process
    Tty: true,
    HostConfig: {
      Binds: [`/var/tmp/codedamn/volumes/${volumeName}:/home/codedamn/`], // Bind the volume
      // NetworkMode: "host",
      // PortBindings: {
      //   "5173/tcp": [{ HostPort: "5173" }],
      //   "1337/tcp": [{ HostPort: "1337" }],
      // },
      PublishAllPorts: true // Equivalent to using `-P` in Docker CLI
    },
    ExposedPorts: {
      "80/tcp": {},
      "443/tcp": {},
      "1337/tcp": {},
      "3000/tcp":{},
      "5000/tcp":{},
      "5173/tcp": {},
      "8000/tcp":{},
      "8080/tcp":{},
    },
  };
  try {
    // Create the container
    console.log("try block -> create the container -> ");
    const container = await docker.createContainer(containerOptions);
    console.log("New container created with ID:", container.id);

    // Start the container
    await container.start();

    console.log("-------------> started the container ");
  } catch (error) {
    console.error("Failed to create And start the container:", error.message);
  }
  console.log("end createVolumeAndContainer -> ", { containerId });
}

export async function startContainer(username) {
  console.log("begin startContainer -> ", { username });
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
      await createVolumeAndContainer(containerId);
    } else {
      console.error("An error occurred:", error.message);
    }
  }
  console.log("end startContainer -> ", { username });
  return container;
}
