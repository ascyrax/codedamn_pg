import * as path from "path";
import * as fsPromises from "fs/promises";
import * as fs from "fs";
import { createVolumeAndContainer, docker } from "./terminalController.js";
import { UserTabsModel } from "../../models/userTabsModel.js";
import { diff_match_patch } from "diff-match-patch";
import { fileUpdateOrigin } from "../../realtime/chokidar.js";

const dmp = new diff_match_patch();

export const getEditorTabs = async (req, res) => {
  let username = "";
  if (req.username) {
    username = req.username;
  }
  const userTabObj = await getUserTabFromDB(username);
  if (userTabObj) {
    res.status(200).json({ success: true, userTabObj });
  } else {
    res.status(404).json({ success: false });
  }
};

export async function updateEditorTabs(req, res) {
  let { tabs, focusedTabName, credentials } = req.body;
  let username = credentials.username ? credentials.username : "";
  try {
    let result = await UserTabsModel.updateOne(
      { username },
      { $set: { tabs, focusedTabName } }
    );
    if (result.modifiedCount) {
      console.log("user tabs updated");
      return res.status(200).json({ success: true });
    } else {
      console.error("nothing to update");
      return res.status(200).json({ success: false, msg: "nothing to modify" });
    }
  } catch (err) {
    console.error("could not update tabs. internal server error: ", err);
    return res.status(500).json({ success: false });
  }
}

export const getFileData = async (req, res) => {
  let username = "",
    fileName = "",
    volumeName = "";
  if (req.username) {
    username = req.username;
    volumeName = "vid_cid_" + req.username;
  }
  if (req.query && req.query.fileName) {
    fileName = req.query.fileName;
  }

  // check if the volume exist or not
  let volCheck = await checkForVolume(volumeName);
  if (!volCheck) {
    let containerId = "cid_" + username;
    await createVolumeAndContainer(containerId);
  }

  await getFileDataFromFS(res, volumeName, fileName);

};

async function getUserTabFromDB(username) {
  try {
    const userTabObj = await UserTabsModel.findOne({ username });
    if (userTabObj) {
      return userTabObj;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error getting userTabObj from the db:", error);
    return undefined;
  }
}

async function checkForVolume(volumeName) {
  try {
    // Ensure the volume exists, or create it if it doesn't
    let volume = docker.getVolume(volumeName);
    let volumeInfo = await volume.inspect().catch(async () => {
      console.error("checkForVolume -> error inspecting the volume");
      throw new Error("volume does not exist");
    });
    return true;
  } catch (error) {
    console.error(
      "checkForVolume -> error inspecting the corresponding volume:",
      error.message
    );
    return false;
  }
}

// get one files
async function getFileDataFromFS(res, volumeName, fileName) {
  if (!fileName) {
    return res.status(404).json({ success: false, msg: `fileName is empty` });
  }

  try {
    // Assuming the volume is mounted on the host in a known directory
    const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);
    const filePath = path.join(volumePath, fileName);
    const language = detectLanguage(fileName);

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": stat.size,
      "Transfer-Encoding": "chunked",
    });

    const readStream = fs.createReadStream(filePath, {
      encoding: "utf8",
      highWaterMark: 1024,
    });

    readStream.on("data", (chunk) => {
      let fileData = {
        name: fileName,
        value: chunk,
        isAnOpenedTab: true,
        language,
      };
      res.write(`${JSON.stringify({ success: true, fileData })}`);
    });

    readStream.on("end", () => {
      res.end(); // End the response when the file stream ends
    });

    readStream.on("error", (err) => {
      console.error("Error streaming file read:", err);
      res
        .status(500)
        .send({ success: false, msg: "Error streaming file read" });
    });
  } catch (error) {
    console.error(`Error accessing ${fileName} in the volume`, error);
    return res.status(500).json({
      success: false,
      msg: `Error accessing ${fileName} in the volume`,
    });
  }
}

// Function to determine the programming language from the file extension
function detectLanguage(filename) {
  // A mapping of file extensions to languages
  const extensionToLanguage = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".py": "python",
    ".java": "java",
    ".cpp": "c++",
    ".cs": "c#",
    ".rb": "ruby",
    ".php": "php",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    ".json": "json",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".c": "c",
    ".h": "cpp",
    ".cs": "csharp",
    ".htm": "html",
    ".sql": "sql",
    ".xml": "xml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".md": "markdown",
    ".r": "r",
    ".pl": "perl",
    ".lua": "lua",
    ".dart": "dart",
    ".swift": "swift",
    ".go": "go",
    ".rs": "rust",
    ".vbs": "vbscript",
    ".ps1": "powershell",
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
    ".m": "objective-c",
  };

  // Extract the file extension
  const extension = path.extname(filename);

  // Get the language from the map or return 'Unknown'
  return extensionToLanguage[extension] || "Unknown";
}

// Function to update files based on the provided object
async function updateFile({ fileName, fileContent }, volumeName) {
  try {
    const filePath = path.join(
      "/var/tmp/codedamn/volumes",
      volumeName,
      fileName
    );
    fileUpdateOrigin.set(filePath, "editor");
    console.log("updateFile -> ", fileUpdateOrigin, { fileUpdateOrigin });
    await fsPromises.writeFile(filePath, fileContent);
    return { success: true };
    // console.log(`Updated file: ${filePath}`);
  } catch (error) {
    console.error(
      `Failed to update file: ${fileName} in volume:${volumeName}. error: `,
      error
    );
    return { success: false };
  }
}

export const setFileData = async (req, res) => {
  let username = "",
    fileName = "",
    volumeName = "",
    filePatch = "";

  if (req.username) {
    username = req.username;
    volumeName = "vid_cid_" + req.username;
  }

  if (req.body && req.body.filePatch) {
    fileName = req.body.filePatch.fileName;
    filePatch = req.body.filePatch.patch;
  }


  let originalText = await getFileContentFromFS(volumeName, fileName);
  let newText = await applyPatch(originalText ? originalText : "", filePatch);

  let fileUpdateResult = await updateFile(
    { fileName, fileContent: newText },
    volumeName
  );

  if (fileUpdateResult.success) {
    res.status(200).json({
      success: true,
      msg: `${fileName} updated successfully`,
      map: Object.fromEntries(fileUpdateOrigin),
      fileName,
    });
  } else {
    res.status(500).json({
      success: false,
      msg: `error updating ${fileName}`,
      map: Object.fromEntries(fileUpdateOrigin),
      fileName,
    });
  }
};

async function getFileContentFromFS(volumeName, fileName) {
  try {
    // Assuming the volume is mounted on the host in a known directory
    const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);
    const filePath = path.join(volumePath, fileName);

    const content = await fsPromises.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error accessing ${fileName} in the volume`, error);
    return undefined;
  }
}

async function applyPatch(originalText, filePatch) {
  try {
    // Assuming `patches` is the patch object received or defined elsewhere
    const patches = dmp.patch_fromText(filePatch);
    const [newText, results] = dmp.patch_apply(patches, originalText);

    if (results.some((result) => !result)) {
      console.log("Some patches did not apply successfully");
      return originalText;
    }
    return newText;
  } catch (err) {
    console.error("applyPatch -> could not apply the patch to the file:", err);
    return originalText;
  }
}
