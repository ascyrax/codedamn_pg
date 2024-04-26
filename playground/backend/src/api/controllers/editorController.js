import { FileDataModel } from "../../models/fileDataModel.js";

const getEditorData = async (req, res) => {
  console.debug(req.url);
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
  console.debug(req.url);

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
