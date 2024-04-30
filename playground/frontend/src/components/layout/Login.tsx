import { useState } from "react";
import { postLoginData, getEditorData } from "../../services/services";
import { LoginProps } from "../../models/interfaces";
import { createWebSocket } from "./TerminalXTerm";

function Login({
  setNeedToRegister,
  setHasUserLoggedIn,
  setFilesData,
}: LoginProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const fetchEditorData = async () => {
    try {
      const responseData = await getEditorData();
      if (responseData) {
        console.log(responseData);
        setFilesData(responseData);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically authenticate against your backend API
    let serverResponseLogin = await postLoginData(credentials);
    console.log(serverResponseLogin);
    if (serverResponseLogin.success) {
      setHasUserLoggedIn(true);
      await createWebSocket();
      console.log("login successful", serverResponseLogin);
      await fetchEditorData();
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
