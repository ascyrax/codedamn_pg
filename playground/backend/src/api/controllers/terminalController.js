import * as Docker from "dockerode";
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

async function createAndStartContainer(containerId) {
  // Container options
  const containerOptions = {
    Image: "ubuntu", // Specify the image name
    // Cmd: ["bash", "-c", 'while true; do echo "Hello, Dockerode!"; sleep 1; done'],
    Cmd: ["bash", "-c", "tail -f /dev/null"],
    name: containerId,
    AttachStdout: true, // Attach container's stdout to the Node.js process
    AttachStderr: true, // Attach container's stderr to the Node.js process
    Tty: true,
  };
  try {
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
