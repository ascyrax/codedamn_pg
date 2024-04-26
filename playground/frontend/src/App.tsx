import { useState } from "react";
// import FrontendTerminal from "./components/FrontendTerminal";
import MonacoEditor from "./components/features/MonacoEditor";
import "./styles/app.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="MonacoEditor">
      <MonacoEditor></MonacoEditor>
    </div>
  );
}

export default App;
