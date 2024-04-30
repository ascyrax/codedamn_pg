import { FileDataModel } from "../../models/fileDataModel.js";
import * as path from "path";
import * as fs from "fs";
import { currentUsername } from "../../server.js";

const getEditorData = async (req, res) => {
  // console.debug(req.url);

  // const volumeName = "vid_cid_" + currentUsername;
  // console.log(volumeName);
  // try {
  //   // Assuming the volume is mounted on the host in a known directory
  //   const volumePath = path.join(
  //     "~/codedamn/volumes",
  //     volumeName,
  //     "_data"
  //   );

  //   // Read files from the volume directory
  //   fs.readdir(volumePath, (err, files) => {
  //     if (err) {
  //       console.error("Error reading volume directory:", err);
  //       return res.status(500).send("Failed to read volume");
  //     }

  //     let results = [];
  //     files.forEach((file) => {
  //       const filePath = path.join(volumePath, file);
  //       const content = fs.readFileSync(filePath, "utf8");
  //       results.push({ file, content });
  //     });

  //     res.json(results);
  //   });
  // } catch (error) {
  //   console.error("Error:", error);
  //   res.status(500).send("Error accessing volume data");
  // }

  try {
    const filesData = await FileDataModel.find();
    // console.log(filesData);
    res.send(filesData);
  } catch (err) {
    res.send("error retreiving filesData");
    console.error(err);
  }
};

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
