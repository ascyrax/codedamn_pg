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
// import { createWebSocket } from "../../services/ws";
import { useEffect } from "react";

function Login({
  ws,
  credentials,
  focusedTabName,
  tree,
  setTree,
  setWs,
  setTerminalData,
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
      const serverResponse = await getEditorTabs(credentials);
      // console.log("userTabObj: ", userTabObj);
      let userTabObj;
      if (serverResponse && serverResponse.success)
        userTabObj = serverResponse.userTabObj;
      if (userTabObj && userTabObj.tabs) {
        setTabNames(userTabObj.tabs);
      }
      if (userTabObj && userTabObj.focusedTabName) {
        setFocusedTabName(userTabObj.focusedTabName);
        setFocusedFileName(userTabObj.focusedTabName);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  };

  async function fetchDataEfficiently() {
    // let token:string | null="";
    // if (credentials && credentials.username)
    //   token = localStorage.getItem(credentials.username);

    await fetchEditorTabs();

    // fetch the focused tab data
    // this is done using the useEffect in the App.tsx, after the focusedTabName has been modified

    // fetch the data for the rest of the opened tabs (using fetch stream)
    // this is done using the useEffect in the App.tsx, after the tabNames has been modified
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically authenticate against your backend API

    if (!credentials || !credentials.username || !credentials.password) {
      console.log(
        "username or password should not be empty. retry loggin in with non-trivial credentials."
      );
      return;
    }

    let serverResponse: LoginServerResponse = await postLoginData(credentials);
    if (serverResponse.success) {
      setHasUserLoggedIn(true);
      // save the jwt in localStorage, corresponding to the credentials.username
      if (credentials && credentials.username && serverResponse.token)
        localStorage.setItem(credentials.username, serverResponse.token);
      console.log(
        "login successful + jwt token saved in localStorage",
        serverResponse
      );
      // ws = await createWebSocket(
      //   ws,
      //   credentials,
      //   tree,
      //   setTerminalData,
      //   setTree
      //   // token
      // );
      // setWs(ws);
      await fetchDataEfficiently();
    } else {
      console.log("could not login");
    }
  };

  const handleRegClick = (_: React.MouseEvent<HTMLButtonElement>) => {
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
        <button type="button" onClick={handleRegClick}>
          Go to Register
        </button>
      </div>
    </div>
  );
}

export default Login;
