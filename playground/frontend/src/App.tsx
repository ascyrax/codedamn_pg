import { useState } from "react";
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
