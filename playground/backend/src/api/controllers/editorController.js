import { FileDataModel } from "../../models/fileDataModel.js";

const getEditorData = (req, res) => {
  console.log(req.url);
  res.send("hello from controller");
};

const setEditorData = async (req, res) => {
  // create OR update the model :)
  // todo check for req.body first :)
  const reqBody = req.body.body;

  for (const [key, val] of Object.entries(reqBody)) {
    try {
      const foundFiles = await FileDataModel.find({ name: key });
      console.log(foundFiles);
      if (foundFiles.length === 0) {
        try {
          const createdFile = await FileDataModel.create(val);
          console.log(createdFile);
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          const updatedFile = await FileDataModel.updateOne({ name: key }, val);
          console.log(updatedFile);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  res.send("hello from controller");
};

export { getEditorData, setEditorData };
