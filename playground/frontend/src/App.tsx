import { useState } from "react";
import MonacoEditor from "./components/features/MonacoEditor.tsx";
import Register from "./components/layout/Register.tsx";
import Login from "./components/layout/Login.tsx";
import { FileDescription } from "./models/interfaces.tsx";
import "./styles/app.css";

function App() {
  const [hasUserLoggedIn, setHasUserLoggedIn] = useState(false);
  const [needToRegister, setNeedToRegister] = useState(false);
  const [filesData, setFilesData] = useState<Record<string, FileDescription>>();
  return (
    <>
      {hasUserLoggedIn ? (
        <div className="MonacoEditor">
          <MonacoEditor
            filesData={filesData}
            setFilesData={setFilesData}
          ></MonacoEditor>
        </div>
      ) : needToRegister ? (
        <Register setNeedToRegister={setNeedToRegister} />
      ) : (
        <Login
          setNeedToRegister={setNeedToRegister}
          setHasUserLoggedIn={setHasUserLoggedIn}
          setFilesData={setFilesData}
        />
      )}
    </>
  );
}

export default App;
