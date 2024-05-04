import * as path from "path";
import * as fs from "fs";
import { createAndStartContainer, docker } from "./terminalController.js";
import { UserTabsModel } from "../../models/UserTabsModel.js";

export const getEditorTabs = async (req, res) => {
  let username = "";
  if (req.username) {
    username = req.username;
  }

  const userTabObj = await getUserTabFromDB(username);
  if (userTabObj) {
    console.log("getEditorTabs -> userTabObj: ", userTabObj);
    res.status(200).json({ success: true, userTabObj });
  } else {
    res.status(404).json({ success: true, userTabObj });
  }
};

async function getUserTabFromDB(username) {
  try {
    const userTabObj = await UserTabsModel.findOne({ username });
    if (userTabObj) {
      console.log("getUserTabFromDB() -> userTabObj: ", userTabObj);
      return userTabObj;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting userTabObj from the db:", error);
    return [];
  }
}

const getEditorData = async (req, res) => {
  let volumeName = "",
    username = "";
  if (req.username) {
    username = req.username;
    volumeName = "vid_cid_" + req.username;
  }

  // check if the volume exist or not
  try {
    // Ensure the volume exists, or create it if it doesn't
    let volume = docker.getVolume(volumeName);
    let volumeInfo = await volume.inspect().catch(async () => {
      console.error("getEditorData -> error inspecting the volume");
      throw new Error("volume does not exist");
    });
    console.log(`getEditorData -> Using volume: ${volumeInfo.name}`);
  } catch (error) {
    console.error(
      "getEditorData -> error inspecting the corresponding volume:",
      error.message
    );
    let containerId = "cid_" + username;
    await createAndStartContainer(containerId);
  }

  try {
    // Assuming the volume is mounted on the host in a known directory
    const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);

    // Read files from the volume directory
    fs.readdir(volumePath, (err, files) => {
      if (err) {
        console.error("Error reading volume directory:", err);
        return res.status(500).send("Failed to read volume");
      }

      let results = [];
      files.forEach((file) => {
        const language = detectLanguage(file);
        const filePath = path.join(volumePath, file);
        const content = fs.readFileSync(filePath, "utf8");
        results.push({
          name: file,
          value: content,
          isAnOpenedTab: true,
          language,
        });
      });
      res.json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error accessing volume data");
  }
};

// Function to determine the programming language from the file extension
function detectLanguage(filename) {
  // A mapping of file extensions to languages
  const extensionToLanguage = {
    ".js": "javascript",
    ".py": "python",
    ".java": "java",
    ".cpp": "c++",
    ".cs": "c#",
    ".rb": "ruby",
    ".php": "php",
    ".ts": "typescript",
    ".html": "html",
    ".css": "css",
  };

  // Extract the file extension
  const extension = path.extname(filename);

  // Get the language from the map or return 'Unknown'
  return extensionToLanguage[extension] || "Unknown";
}

// Function to update files based on the provided object
async function updateFiles({ fileName, fileContent }, volumeName) {
  try {
    const filePath = path.join(
      "/var/tmp/codedamn/volumes",
      volumeName,
      fileName
    );

    fs.writeFileSync(filePath, fileContent);
    console.log(`Updated file: ${filePath}`);
  } catch (error) {
    console.error("Failed to update files:", error);
  }
}

const setEditorData = async (req, res) => {
  let reqBody = "";
  if (req.body && req.body.body) reqBody = req.body.body;
  let volumeName = "";
  // }
  if (req.username) volumeName = "vid_cid_" + req.username;
  for (const [key, val] of Object.entries(reqBody)) {
    let { name, value, isAnOpenedTab, language } = val;
    try {
      await updateFiles({ fileName: key, fileContent: value }, volumeName);
    } catch (err) {
      console.error(":( error updatingFiles at the mounted volumes", err);
    }
  }
  res.send("filesData updated");
};

export { getEditorData, setEditorData };
