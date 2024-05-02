import { postLoginData, getEditorData } from "../../services/services";
import { LoginProps, LoginServerResponse } from "../../models/interfaces";
import { createWebSocket } from "./TerminalXTerm";

function Login({
  credentials,
  setNeedToRegister,
  setHasUserLoggedIn,
  setFilesData,
  setCredentials,
}: LoginProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const fetchEditorData = async () => {
    try {
      const responseData = await getEditorData(credentials);
      if (responseData) {
        setFilesData(responseData);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  };

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
      await fetchEditorData();
      await createWebSocket(credentials);
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
