import axios from "axios";
import { FileDescription } from "../models/interfaces";
import { convertFilesData, SERVER_DOMAIN, SERVER_PORT } from "../utils/utils";
import { user, credentials } from "../models/interfaces";
import { diff_match_patch } from "diff-match-patch";

const dmp = new diff_match_patch();

export async function postCodeChange(
  filesData: Record<string, FileDescription>,
  _: credentials,
  fileName: string | undefined,
  originalText: string,
  newText: string,
  setPrevFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void
) {
  fileName = removePlaygroundPrefix(fileName);

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

export async function updateEditorTabs(
  credentials: credentials,
  tabs: string[],
  focusedTabName: string
) {
  // const token = localStorage.getItem(credentials.username);
  // if (token) {
  //   // Set up common headers
  //   axios.defaults.headers.common["token"] = token;
  // }
  // post request
  try {
    const response = await axios.post(
      `${SERVER_DOMAIN}:${SERVER_PORT}/editorData/tabs`,
      {
        title: "update editor tabs",
        credentials: credentials,
        tabs: tabs,
        focusedTabName: focusedTabName,
      }
    );
    if (response.data) {
      console.log("updateEditorTabs ", response.data);
      return response.data;
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getEditorTabs(credentials: credentials) {
  let token;
  if (credentials && credentials.username)
    token = localStorage.getItem(credentials.username);
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
      console.log("getEditorTabs ", response.data);
      return response.data;
    } else return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// Function to remove the prefix 'playground' from a filename
function removePlaygroundPrefix(filename: string | undefined) {
  const prefix = "playground";
  // Check if the filename starts with the prefix and remove it
  if (filename && filename.startsWith(prefix)) {
    // console.log(filename);
    return filename.slice(prefix.length);
  }
  return filename;
}

export async function getFileData(fileName: string | undefined) {
  //  TODO  REMOVE  THE PREFIX "playground" from the file name
  fileName = removePlaygroundPrefix(fileName);
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

export async function postRegisterData(user: user) {
  try {
    const response = await axios.post(
      `${SERVER_DOMAIN}:${SERVER_PORT}/auth/register`,
      {
        title: "register new user",
        user: user,
      }
    );
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(
      `error in user registration: user: ${user} , error: ${error}`
    );
    return undefined;
  }
}

export async function postLoginData(credentials: credentials) {
  try {
    const response = await axios.post(
      `${SERVER_DOMAIN}:${SERVER_PORT}/auth/login`,
      {
        title: "login user",
        credentials: credentials,
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
