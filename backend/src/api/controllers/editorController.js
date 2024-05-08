import * as path from "path";
import * as fs from "fs/promises";
import { createVolumeAndContainer, docker } from "./terminalController.js";
import { UserTabsModel } from "../../models/UserTabsModel.js";
import { diff_match_patch } from "diff-match-patch";

const dmp = new diff_match_patch();

export const getEditorTabs = async (req, res) => {
  let username = "";
  if (req.username) {
    username = req.username;
  }
  // console.log("getEditorTabs: ", { username });
  const userTabObj = await getUserTabFromDB(username);
  if (userTabObj) {
    // console.log("getEditorTabs -> userTabObj: ", userTabObj);
    res.status(200).json({ success: true, userTabObj });
  } else {
    res.status(404).json({ success: false });
  }
};

export async function updateEditorTabs(req, res) {
  let { tabs, focusedTabName, credentials } = req.body;
  let username = credentials.username ? credentials.username : "";
  // console.log("updateEditorTabs:", { tabs }, { focusedTabName }, { username });
  try {
    let result = await UserTabsModel.updateOne(
      { username },
      { $set: { tabs, focusedTabName } }
    );
    // console.log({ result });
    // console.log("result.modifiedCount:", result.modifiedCount);
    if (result.modifiedCount) {
      console.log("user tabs updated");
      return res.status(200).json({ success: true });
    } else {
      console.error("nothing to update");
      return res.status(500).json({ success: false });
    }
  } catch (err) {
    console.error("could not update tabs. internal server error: ", err);
    return res.status(500).json({ success: false });
  }
}

// TODO IMPLEMENT FETCH STREAMING FOR THIS
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

  // console.log("getFileData -> ", username, fileName);

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
      // console.log("getUserTabFromDB() -> userTabObj: ", userTabObj);
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
  // console.log("checkForVolume: ", volumeName);
  try {
    // Ensure the volume exists, or create it if it doesn't
    let volume = docker.getVolume(volumeName);
    let volumeInfo = await volume.inspect().catch(async () => {
      console.error("checkForVolume -> error inspecting the volume");
      throw new Error("volume does not exist");
    });
    // console.log(`checkForVolume -> Using volume: ${volumeInfo.Name}`);
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
  try {
    // Assuming the volume is mounted on the host in a known directory
    const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);
    const filePath = path.join(volumePath, fileName);
    const language = detectLanguage(fileName);

    let fileData = {};
    const content = await fs.readFile(filePath, "utf8");

    fileData = {
      name: fileName,
      value: content,
      isAnOpenedTab: true,
      language,
    };

    if (fileData)
      return res.status(200).json({ success: true, fileData: fileData });
    else
      return res.status(500).json({
        success: false,
        msg: `Error accessing ${fileName} in the volume ${volumePath}`,
      });
  } catch (error) {
    console.error(`Error accessing ${fileName} in the volume`, error);
    return res.status(500).json({
      success: false,
      msg: `Error accessing ${fileName} in the volume`,
    });
  }
}

// // get all files
// async function getFilesDataFromFS(res, volumeName) {
//   try {
//     // Assuming the volume is mounted on the host in a known directory
//     const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);

//     // Read files from the volume directory
//     fs.readdir(volumePath, (err, files) => {
//       if (err) {
//         console.error("Error reading volume directory:", err);
//         return res
//           .status(500)
//           .json({ success: false, msg: "Failed to read volume" });
//       }

//       let fileData = [];
//       files.forEach((file) => {
//         const language = detectLanguage(file);
//         const filePath = path.join(volumePath, file);
//         const content = fs.readFileSync(filePath, "utf8");
//         results.push({
//           name: file,
//           value: content,
//           isAnOpenedTab: true,
//           language,
//         });
//       });
//       return res.status(200).json({ success: true, filesData: results });
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res
//       .status(500)
//       .json({ success: false, msg: "Error accessing volume data" });
//   }
// }

// const getEditorData = async (req, res) => {
//   let volumeName = "",
//     username = "";
//   if (req.username) {
//     username = req.username;
//     volumeName = "vid_cid_" + req.username;
//   }

//   // check if the volume exist or not
//   let volCheck = await checkForVolume(volumeName);
//   if (!volCheck) {
//     let containerId = "cid_" + username;
//     await createVolumeAndContainer(containerId);
//   }

//   return await getFilesDataFromFS(res, volumeName);
// };

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
async function updateFile({ fileName, fileContent }, volumeName) {
  try {
    const filePath = path.join(
      "/var/tmp/codedamn/volumes",
      volumeName,
      fileName
    );

    await fs.writeFile(filePath, fileContent);
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

  // console.log("setFileData: ", username, fileName, volumeName, filePatch);

  let originalText = await getFileContentFromFS(volumeName, fileName);
  // console.log("setFileData: ", { originalText });
  let newText = await applyPatch(originalText ? originalText : "", filePatch);
  // console.log("setFileData: ", { newText });

  let fileUpdateResult = await updateFile(
    { fileName, fileContent: newText },
    volumeName
  );
  if (fileUpdateResult.success) {
    res
      .status(200)
      .json({ success: true, msg: `${fileName} updated successfully` });
  } else {
    res.status(500).json({ success: false, msg: `error updating ${fileName}` });
  }
};

async function getFileContentFromFS(volumeName, fileName) {
  try {
    // Assuming the volume is mounted on the host in a known directory
    const volumePath = path.join("/var/tmp/codedamn/volumes", volumeName);
    const filePath = path.join(volumePath, fileName);

    const content = await fs.readFile(filePath, "utf8");
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
    // console.log("Patch results:", results); // This will show which patches were applied successfully

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
