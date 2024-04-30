import { FileDataModel } from "../../models/fileDataModel.js";
import * as path from "path";
import * as fs from "fs";
import { currentUsername } from "../../server.js";

const getEditorData = async (req, res) => {
  let username = currentUsername || "";
  if (req.cookies && req.cookies.username) {
    username = req.cookies.username;
  }

  const volumeName = "vid_cid_" + username;
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
        results.push({ name: file, value: content, isAnOpenedTab:true,  language});
      });
      console.log(results);
      res.json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error accessing volume data");
  }

  // try {
  //   const filesData = await FileDataModel.find();
  //   // console.log(filesData);
  //   res.send(filesData);
  // } catch (err) {
  //   res.send("error retreiving filesData");
  //   console.error(err);
  // }
};

// Function to determine the programming language from the file extension
function detectLanguage(filename) {
  // A mapping of file extensions to languages
  const extensionToLanguage = {
      '.js': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.cs': 'C#',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.ts': 'TypeScript',
      '.html': 'HTML',
      '.css': 'CSS'
  };

  // Extract the file extension
  const extension = path.extname(filename);

  // Get the language from the map or return 'Unknown'
  return extensionToLanguage[extension] || 'Unknown';
}
const setEditorData = async (req, res) => {
  // console.debug(req.url);

  // create OR update the model :)
  // todo check for req.body first :)
  const reqBody = req.body.body;
  for (const [key, val] of Object.entries(reqBody)) {
    try {
      const foundFiles = await FileDataModel.find({ name: key });
      if (foundFiles.length === 0) {
        try {
          const createdFile = await FileDataModel.create(val);
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          const updatedFile = await FileDataModel.updateOne({ name: key }, val);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  res.send("filesData updated");
};

export { getEditorData, setEditorData };
