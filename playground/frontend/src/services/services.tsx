import axios from "axios";
import * as interfaces from "../models/interfaces";
import * as utils from "../utils/utils";

export function postCodeChange(
  filesData: Record<string, interfaces.FileDescription>
) {
  // post request
  async function makePostRequest() {
    try {
      const response = await axios.post("http://localhost:3000/editordata", {
        title: "batch update for file edits",
        body: filesData,
        userId: 1,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  makePostRequest();
}

export async function getEditorData() {
  // get request
  let modifiedResponseData = {};
  try {
    const response = await axios.get("http://localhost:3000/editordata");
    if (response.data) {
      modifiedResponseData = utils.convertFilesData(response.data);
    }
    return modifiedResponseData;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
