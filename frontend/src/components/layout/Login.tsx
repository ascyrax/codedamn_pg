import {
  postLoginData,
  getEditorTabs,
  // getEditorData,
} from "../../services/services";
import {
  FileDescription,
  LoginProps,
  LoginServerResponse,
} from "../../models/interfaces";
import { createWebSocket } from "./TerminalXTerm";
import { useEffect } from "react";

function Login({
  credentials,
  focusedTabName,
  setNeedToRegister,
  setHasUserLoggedIn,
  setFilesData,
  setCredentials,
  setTabNames,
  setFocusedTabName,
  setFocusedFileName,
}: LoginProps) {
  // console.log("RENDER Login");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // const fetchEditorData = async () => {
  //   try {
  //     const editorData = await getEditorData(credentials);
  //     // console.log("fetchEditorData -> editorData: ", editorData)
  //     if (editorData) {
  //       setFilesData(editorData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching editor data:", error);
  //   }
  // };

  const fetchEditorTabs = async () => {
    try {
      const userTabObj = await getEditorTabs(credentials);
      // console.log("userTabObj: ", userTabObj);
      if (userTabObj) {
        setTabNames(userTabObj.tabs);
      }
      if (userTabObj.focusedTabName) {
        setFocusedTabName(userTabObj.focusedTabName);
        setFocusedFileName(userTabObj.focusedTabName);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  };

  async function fetchDataEfficiently() {
    await fetchEditorTabs();

    // fetch the focused tab data
    // this is done using the useEffect in the App.tsx, after the focusedTabName has been modified

    // fetch the data for the rest of the opened tabs (using fetch stream)
    // this is done using the useEffect in the App.tsx, after the tabNames has been modified

    // await fetchEditorData();
    await createWebSocket(credentials);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically authenticate against your backend API
    let serverResponseLogin: LoginServerResponse = await postLoginData(
      credentials
    );
    if (serverResponseLogin.success) {
      setHasUserLoggedIn(true);
      // save the jwt in localStorage, corresponding to the credentials.username
      localStorage.setItem(credentials.username, serverResponseLogin.token);

      console.log("login successful", serverResponseLogin);
      await fetchDataEfficiently();
    } else {
      console.log("could not login");
    }
  };

  const handleClick = (_: React.MouseEvent<HTMLButtonElement>) => {
    setNeedToRegister(true);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <div className="goto">
        Not Registered yet ?
        <button type="button" onClick={handleClick}>
          Go to Register
        </button>
      </div>
    </div>
  );
}

export default Login;
