import { useEffect, useRef, useState } from "react";
import Editor, {
  DiffEditor,
  useMonaco,
  loader,
  Monaco,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CodeEditor from "./CodeEditor";
import Explorer from "./Explorer";
import Tabs from "./Tabs";

import { Rnd } from "react-rnd";

// all this needs to come from the backend.

// Define the interface for each file description
interface FileDescription {
  name: string;
  language: string;
  value: string;
  isAnOpenedTab: boolean;
}

// Assuming some example contents for each type of file
const someJSCodeExample: string = `console.log('Hello, world!');`;
const someCSSCodeExample: string = `body { background-color: #f0f0f0; }`;
const someHTMLCodeExample: string = `<html><body>Hello, world!</body></html>`;

// Define the files object with type annotations
const filesData: Record<string, FileDescription> = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: someJSCodeExample,
    isAnOpenedTab: true,
  },
  "style.css": {
    name: "style.css",
    language: "css",
    value: someCSSCodeExample,
    isAnOpenedTab: true,
  },
  "index.html": {
    name: "index.html",
    language: "html",
    value: someHTMLCodeExample,
    isAnOpenedTab: true,
  },
};

// frontend
const MonacoEditor: React.FC = () => {
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [focusedTabName, setFocusedTabName] = useState<string>();
  const [focusedFileName, setFocusedFileName] = useState<string>();
  // const [directoryNames, setDirectoryNames] = useState([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    // make a get request to the backend for filesData
    let listFileNames: string[] = [],
      listTabNames: string[] = [];
    Object.entries(filesData).forEach((fileDataEl, index) => {
      const fileName = fileDataEl[0];
      const fileData = fileDataEl[1];
      listFileNames.push(fileName);
      if (fileData.isAnOpenedTab) listTabNames.push(fileName);
    });
    setFileNames(listFileNames);
    setTabNames(listTabNames);
  }, []);

  function handleCodeChange(
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) {
    if (focusedFileName && value) {
      filesData[focusedFileName].value = value;
    }

    // todo: send a PUT request to the backend :)
  }

  function handleEditorMount(
    editorInstance: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;
  }

  function handleTabClick(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.target as HTMLButtonElement;
    setFocusedTabName(target.innerText);
    setFocusedFileName(target.innerText);
  }
  const [size, setSize] = useState(200);

  const handleDragFinished = (newSize: number) => {
    console.log("Resize finished. New size:", newSize);
    setSize(newSize);
  };

  const handleChange = (newSize: number) => {
    console.log("Current size:", newSize);
  };

  return (
    <div id="monacoEditor">
      <Rnd
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "solid 1px #ddd",
          background: "#f0f0f0",
        }}
        bounds="parent"
        minWidth="150"
        minHeight="150"
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <div id="left">
          <Explorer />
        </div>
      </Rnd>
      <div id="right">
        <Tabs
          tabNames={tabNames}
          focusedTabName={focusedTabName}
          handleTabClick={handleTabClick}
        />
        <CodeEditor
          focusedFileName={focusedFileName}
          focusedTabName={focusedTabName}
          handleCodeChange={handleCodeChange}
          handleEditorMount={handleEditorMount}
          filesData={filesData}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
