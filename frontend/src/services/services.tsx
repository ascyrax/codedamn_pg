import axios from "axios";
import { FileDescription } from "../models/interfaces";
import { convertFilesData } from "../utils/utils";
import { user, credentials } from "../models/interfaces";

// axios.defaults.withCredentials = true;

export function postCodeChange(
  credentials: credentials,
  filesData: Record<string, FileDescription>
) {
  const token = localStorage.getItem(credentials.username);
  async function makePostRequest() {
    try {
      const response = await axios.post("http://localhost:3000/editordata", {
        title: "batch update for file edits",
        body: filesData,
        userId: 1,
      });
      if (response && response.data)
        console.log("serverResponse:", response.data);
    } catch (error) {
      console.error(error);
    }
  }

  makePostRequest();
}

export async function getEditorData(credentials: credentials) {
  const token = localStorage.getItem(credentials.username);
  if (token) {
    // Set up common headers
    axios.defaults.headers.common["token"] = token;
  }
  // get request
  let modifiedResponseData = {};
  try {
    const response = await axios.get("http://localhost:3000/editorData");
    if (response.data) {
      modifiedResponseData = convertFilesData(response.data);
    }
    return modifiedResponseData;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function postRegisterData(user: user) {
  try {
    const response = await axios.post("http://localhost:3000/auth/register", {
      title: "register new user",
      body: user,
      userId: 1,
      // withCredentials: true,
    });
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
    const response = await axios.post("http://localhost:3000/auth/login", {
      title: "login user",
      body: credentials,
      userId: 1,
      // withCredentials: true,
    });
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
