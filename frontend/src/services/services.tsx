import axios from "axios";
import { FileDescription } from "../models/interfaces";
import { convertFilesData, SERVER_DOMAIN, SERVER_PORT } from "../utils/utils";
import { user, credentials } from "../models/interfaces";
import { diff_match_patch } from "diff-match-patch";

const dmp = new diff_match_patch();

export async function postCodeChange(
  filesData: Record<string, FileDescription>,
  _: credentials,
  fileName: string,
  originalText: string,
  newText: string,
  setPrevFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void
) {
  const diffs = dmp.diff_main(originalText, newText);
  dmp.diff_cleanupSemantic(diffs);
  // console.log("Diffs:", diffs);

  // Create a patch
  // const patch = dmp.patch_make(originalText, diffs);
  const patch = dmp.patch_toText(dmp.patch_make(originalText, diffs));

  // console.log("Patch:", patch);

  async function makePostRequest() {
    try {
      const response = await axios.post(
        `${SERVER_DOMAIN}:${SERVER_PORT}/editordata`,
        {
          title: "differential batch update for file edits",
          filePatch: { fileName, patch },
        }
      );
      if (response && response.data)
        console.log("serverResponse:", response.data);
    } catch (error) {
      console.error(error);
    }
  }

  await makePostRequest();

  setPrevFilesData(filesData);
}

export async function getEditorTabs(credentials: credentials) {
  const token = localStorage.getItem(credentials.username);
  if (token) {
    // Set up common headers
    axios.defaults.headers.common["token"] = token;
  }
  // get request
  try {
    const response = await axios.get(
      `${SERVER_DOMAIN}:${SERVER_PORT}/editorData/tabs`
    );
    if (response.data) {
      if (response.data.success) {
        console.log("getEditorTabs ", response.data);
        return response.data.userTabObj;
      }
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getFileData(fileName: string | undefined) {
  let response;
  try {
    response = await axios.get(
      `${SERVER_DOMAIN}:${SERVER_PORT}/editorData/file?fileName=${fileName}`
    );
    if (response.data) {
      console.log("getFileData -> ", response.data);
    }
  } catch (error) {
    console.error(
      "could not get file data for the first focused file: ",
      error
    );
  }
  return response ? response.data : response;
}

// export async function getEditorData(credentials: credentials) {
//   // const token = localStorage.getItem(credentials.username);
//   // if (token) {
//   //   // Set up common headers
//   //   axios.defaults.headers.common["token"] = token;
//   // }
//   // get request
//   let modifiedResponseData = {};
//   try {
//     const response = await axios.get(
//       `${SERVER_DOMAIN}:${SERVER_PORT}/editorData`
//     );
//     if (response.data && response.data.filesData) {
//       console.log("getEditorData", response.data);
//       modifiedResponseData = convertFilesData(response.data.filesData);
//       console.log("getEditorData", modifiedResponseData);
//     }
//     return modifiedResponseData;
//   } catch (error) {
//     console.error(error);
//     return undefined;
//   }
// }

export async function postRegisterData(user: user) {
  try {
    const response = await axios.post(
      `${SERVER_DOMAIN}:${SERVER_PORT}/auth/register`,
      {
        title: "register new user",
        body: user,
        userId: 1,
        // withCredentials: true,
      }
    );
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function postLoginData(credentials: credentials) {
  try {
    const response = await axios.post(
      `${SERVER_DOMAIN}:${SERVER_PORT}/auth/login`,
      {
        title: "login user",
        body: credentials,
        userId: 1,
      }
    );
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
