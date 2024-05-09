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
  // console.log("postCodeChange: ", fileName, originalText, newText);
  fileName = removePlaygroundPrefix(fileName);

  const diffs = dmp.diff_main(originalText, newText);
  dmp.diff_cleanupSemantic(diffs);
  // console.log("Diffs:", diffs);

  // Create a patch
  // const patch = dmp.patch_make(originalText, diffs);
  const patch = dmp.patch_toText(dmp.patch_make(originalText, diffs));
  if (!patch) {
    console.log("empty patch.");
    return;
  }

  // console.log("Patch:", patch);

  async function makePostRequest() {
    try {
      const response = await axios.post(
        `${SERVER_DOMAIN}:${SERVER_PORT}/editordata/file`,
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
  const prefix = "playground/";
  // Check if the filename starts with the prefix and remove it
  if (filename && filename.startsWith(prefix)) {
    // console.log(filename);
    return filename.slice(prefix.length);
  }
  return filename;
}

export async function getFileData(
  fileName: string | undefined,
  credentials: credentials,
  setFilesData: React.Dispatch<
    React.SetStateAction<Record<string, FileDescription>>
  >,
  setPrevFilesData: React.Dispatch<
    React.SetStateAction<Record<string, FileDescription>>
  >
) {
  fileName = removePlaygroundPrefix(fileName);
  await fetchJSONStream(
    `${SERVER_DOMAIN}:${SERVER_PORT}/editorData/file?fileName=${fileName}`,
    credentials.username,
    setFilesData,
    setPrevFilesData
  );
}

async function fetchJSONStream(
  url: string,
  username: string,
  setFilesData: React.Dispatch<
    React.SetStateAction<Record<string, FileDescription>>
  >,
  setPrevFilesData: React.Dispatch<
    React.SetStateAction<Record<string, FileDescription>>
  >
) {
  let token = localStorage.getItem(username);
  if (!token) token = "";

  try {
    const response = await fetch(url, { headers: { token: token } });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    if (!response.body) {
      console.error("ReadableStream not supported in this browser.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) {
        done = true;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      // Regular expression to extract individual JSON objects
      const regex = /{"success":true,"fileData":{.*?}}/g;

      // Extract all matches
      const matches = chunk.match(regex);

      // Parse each JSON object
      const jsonArray =
        matches &&
        matches
          .map((jsonString) => {
            try {
              return JSON.parse(jsonString);
            } catch (error) {
              console.error("Error parsing JSON:", error);
              return null;
            }
          })
          .filter(Boolean); // Filter out any null values due to errors

      // Display the final parsed array
      // console.log(JSON.stringify(jsonArray, null, 2));

      let name = "",
        isAnOpenedTab = true,
        language = "";
      for (let i = 0; i < (jsonArray ? jsonArray.length : 0); i++) {
        if (jsonArray && jsonArray[i]) {
          try {
            if (jsonArray[i] && jsonArray[i].fileData) {
              if (jsonArray[i].fileData.name)
                name = `playground/${jsonArray[i].fileData.name}`;
              if (jsonArray[i].fileData.value)
                buffer += jsonArray[i].fileData.value;
              if (jsonArray[i].fileData.language)
                language = jsonArray[i].fileData.language;
              if (jsonArray[i].fileData.isAnOpenedTab)
                isAnOpenedTab = jsonArray[i].fileData.isAnOpenedTab;
            }
          } catch (err) {
            console.log("error parsing the chunk:", err);
          }
        }
      }

      // if (parsedChunk.success && parsedChunk.fileData) {
      setFilesData((prevFilesData) => {
        return {
          ...prevFilesData,
          [name]: {
            ...prevFilesData[name],
            name,
            value: buffer,
            isAnOpenedTab,
            language,
          },
        } as Record<string, FileDescription>;
      });
      setPrevFilesData((prevFilesData) => {
        return {
          ...prevFilesData,
          [name]: {
            ...prevFilesData[name],
            name,
            value: buffer,
            isAnOpenedTab,
            language,
          },
        } as Record<string, FileDescription>;
      });
      // }
    }
    console.log("Finished streaming file data");
  } catch (error) {
    console.error(`Fetch JSON stream error: ${error}`);
  }
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
