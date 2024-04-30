import MonacoEditor from "./components/features/MonacoEditor";
import Register from "./components/layout/Register.tsx";
import Login from "./components/layout/Login.tsx";

import "./styles/app.css";
import { useState } from "react";

function App() {
  const [hasUserLoggedIn, setHasUserLoggedIn] = useState(false);
  const [needToRegister, setNeedToRegister] = useState(false);
  return (
    <>
      {hasUserLoggedIn ? (
        <div className="MonacoEditor">
          <MonacoEditor></MonacoEditor>
        </div>
      ) : needToRegister ? (
        <Register setNeedToRegister={setNeedToRegister} />
      ) : (
        <Login
          setNeedToRegister={setNeedToRegister}
          setHasUserLoggedIn={setHasUserLoggedIn}
        />
      )}
    </>
  );
}

export default App;
