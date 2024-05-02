import { useState } from "react";
import MonacoEditor from "./components/features/MonacoEditor.tsx";
import Register from "./components/layout/Register.tsx";
import Login from "./components/layout/Login.tsx";
import { FileDescription, credentials } from "./models/interfaces.tsx";
import "./styles/app.css";

function App() {
  const [hasUserLoggedIn, setHasUserLoggedIn] = useState(false);
  const [needToRegister, setNeedToRegister] = useState(false);
  const [filesData, setFilesData] = useState<Record<string, FileDescription>>();
  const [credentials, setCredentials] = useState<credentials>({
    username: "",
    password: "",
  });

  return (
    <>
      {hasUserLoggedIn ? (
        <div className="MonacoEditor">
          <MonacoEditor
            filesData={filesData}
            credentials={credentials}
            setFilesData={setFilesData}
            setCredentials={setCredentials}
          ></MonacoEditor>
        </div>
      ) : needToRegister ? (
        <Register setNeedToRegister={setNeedToRegister} />
      ) : (
        <Login
          credentials={credentials}
          setNeedToRegister={setNeedToRegister}
          setHasUserLoggedIn={setHasUserLoggedIn}
          setFilesData={setFilesData}
          setCredentials={setCredentials}
        />
      )}
    </>
  );
}

export default App;
