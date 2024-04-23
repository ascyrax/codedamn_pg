import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ResizableHorizontalDivs from "./ResizableHorizontalDivs";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ResizableHorizontalDivs />
    </>
  );
}

export default App;
