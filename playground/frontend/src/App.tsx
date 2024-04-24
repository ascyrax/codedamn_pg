import { useState } from "react";
// import FrontendTerminal from "./components/FrontendTerminal";
import MonacoEditor from "./components/MonacoEditor/MonacoEditor";
import "./styles/app.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="MonacoEditor">
        <MonacoEditor></MonacoEditor>
      </div>
      {/* <div className="Terminal">
        <header className="App-header">
          <h1>React Terminal Emulator</h1>
        </header>
        <div
          style={{
            padding: "20px",
            height: "300px",
            width: "80%",
            margin: "auto",
          }}
        >
          <FrontendTerminal />
        </div>
      </div> */}
    </>
  );
}

export default App;
