import axios from "axios";
import { FileDescription } from "../models/interfaces";
import { convertFilesData, SERVER_DOMAIN, SERVER_PORT } from "../utils/utils";
import { user, credentials } from "../models/interfaces";

export function postCodeChange(
  _: credentials,
  filesData: Record<string, FileDescription>
) {
  async function makePostRequest() {
    try {
      const response = await axios.post(
        `${SERVER_DOMAIN}:${SERVER_PORT}/editordata`,
        {
          title: "batch update for file edits",
          body: filesData,
          userId: 1,
        }
      );
      if (response && response.data)
        console.log("serverResponse:", response.data);
    } catch (error) {
      console.error(error);
    }
  }

  makePostRequest();
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
        console.log("getEditorTabs -> response.data = ", response.data);
        return response.data.userTabObj;
      }
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getEditorData(credentials: credentials) {
  // const token = localStorage.getItem(credentials.username);
  // if (token) {
  //   // Set up common headers
  //   axios.defaults.headers.common["token"] = token;
  // }
  // get request
  let modifiedResponseData = {};
  try {
    const response = await axios.get(
      `${SERVER_DOMAIN}:${SERVER_PORT}/editorData`
    );
    if (response.data) {
      console.log("getEditorData", response.data);
      modifiedResponseData = convertFilesData(response.data);
      console.log("getEditorData", modifiedResponseData);
    }
    return modifiedResponseData;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

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
