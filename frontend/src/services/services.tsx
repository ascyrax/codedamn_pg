import axios from "axios";
import { FileDescription } from "../models/interfaces";
import { convertFilesData } from "../utils/utils";
import { user, credentials } from "../models/interfaces";

// const baseURL = "http://ec2-65-0-6-223.ap-south-1.compute.amazonaws.com";
const baseURL = "http://localhost";
const basePORT = "3000";

export function postCodeChange(
  _: credentials,
  filesData: Record<string, FileDescription>
) {
  async function makePostRequest() {
    try {
      const response = await axios.post(`${baseURL}:${basePORT}/editordata`, {
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
    const response = await axios.get(`${baseURL}:${basePORT}/editorData`);
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
    const response = await axios.post(`${baseURL}:${basePORT}/auth/register`, {
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
    const response = await axios.post(`${baseURL}:${basePORT}/auth/login`, {
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
