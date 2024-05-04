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

// import React, { useState } from "react";
// import CodeEditor from "./CodeEditor.tsx"; // Adjust the path as necessary

// function App() {
//   const [code, setCode] = useState("// type your code here");

//   const handleEditorChange = (newValue: any) => {
//     setCode(newValue);
//   };

//   return (
//     <div>
//       <CodeEditor
//         // language="html"
//         defaultLanguage="html"
//         theme="vs-dark"
//         code={code}
//         onChange={handleEditorChange}
//       />
//     </div>
//   );
// }

// export default App;
