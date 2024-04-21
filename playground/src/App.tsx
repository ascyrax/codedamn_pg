import { useState } from "react";
import MonacoEditor from "./components/MonacoEditor";
import FrontendTerminal from "./components/FrontendTerminal";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <div className="Editor">
        <MonacoEditor />
      </div>
      <div className="Terminal">
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
      </div>
    </>
  );
}

export default App;
