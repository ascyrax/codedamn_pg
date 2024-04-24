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
import { Rnd, RndResizeCallback } from "react-rnd";
import { debounce } from "lodash-es";
import axios from "axios";

// all this needs to come from the backend.

// Define the interface for each file description
interface FileDescription {
  name: string;
  language: string;
  value: string;
  isAnOpenedTab: boolean;
}

// Define the files object with type annotations
const filesData: Record<string, FileDescription> = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: `console.log('Hello, world!');`,
    isAnOpenedTab: true,
  },
  "style.css": {
    name: "style.css",
    language: "css",
    value: `body { background-color: #f0f0f0; }`,
    isAnOpenedTab: true,
  },
  "index.html": {
    name: "index.html",
    language: "html",
    value: `<html><body>Hello, world!</body></html>`,
    isAnOpenedTab: true,
  },
};

const initialExplorerWidth = 250,
  initialEditorHeight = 700;

// frontend
const MonacoEditor: React.FC = () => {
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [focusedTabName, setFocusedTabName] = useState<string>();
  const [focusedFileName, setFocusedFileName] = useState<string>();
  // const [directoryNames, setDirectoryNames] = useState([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // for resizing the explorer & the editor
  const [widthExplorer, setWidthExplorer] =
    useState<number>(initialExplorerWidth);
  const [heightEditor, setheightEditor] = useState<number>(initialEditorHeight);

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

  function postCodeChange() {
    // post request
    async function makePostRequest() {
      try {
        const response = await axios.post("http://localhost:3000/editordata", {
          title: "batch update for file edits",
          body: filesData,
          userId: 1,
        });
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    makePostRequest();
  }

  function handleCodeChange(
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) {
    if (focusedFileName && value) {
      filesData[focusedFileName].value = value;
    }
    // todo: send a PUT request to the backend :)
    // debounce ie batch the change requests,
    // also keep a maxWait after which the function is forced to be executed

    batchUpdate();
  }
  const batchUpdate = debounce(postCodeChange, 1000);

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

  const monacoEditor = document.getElementById("monacoEditor");

  const handleExplorerResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    let currentWidth = elementRef.offsetWidth;
    // currentWidth = getExplorerWidth(currentWidth);
    setWidthExplorer(currentWidth);
  };

  const handleEditorResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    setheightEditor(elementRef.offsetHeight);
  };

  // terminal
  const minTerminalHeight = 100;
  // editor
  const minEditorWidth = 100,
    minEditorHeight = 100,
    maxEditorHeight =
      (monacoEditor ? monacoEditor.offsetHeight : window.innerHeight) -
      minTerminalHeight;
  // explorer
  const minExplorerWidth = 100,
    maxExplorerWidth =
      (monacoEditor ? monacoEditor.offsetWidth : window.innerWidth) -
      minEditorWidth;

  const getEditorWidth = () => {
    let result =
      (monacoEditor ? monacoEditor.offsetWidth : window.innerWidth) -
      widthExplorer;
    return result;
  };
  const getTerminalHeight = () => {
    let result = monacoEditor
      ? monacoEditor.offsetHeight - heightEditor
      : window.innerHeight - heightEditor;
    return result;
  };
  return (
    <div id="monacoEditor">
      <Rnd
        size={{ width: widthExplorer, height: "100vh" }}
        position={{ x: 0, y: 0 }}
        disableDragging={true}
        bounds="parent"
        enableResizing={{
          right: true,
        }}
        onResize={handleExplorerResize}
        style={{
          background: "rgba(0,255,0,0.5)",
        }}
        minWidth={minExplorerWidth}
        maxWidth={maxExplorerWidth}
      >
        <Explorer
          setFocusedTabName={setFocusedTabName}
          setFocusedFileName={setFocusedFileName}
          focusedFileName={focusedFileName}
        />
      </Rnd>

      <Rnd
        size={{
          width: getEditorWidth(),
          height: "100vh",
        }}
        position={{ x: widthExplorer, y: 0 }}
        bounds="parent"
        style={{
          background: "rgba(0,255,0,0.5)",
        }}
        enableResizing={false}
        disableDragging={true}
      >
        <Rnd
          size={{
            width: "100%",
            height: heightEditor,
          }}
          position={{ x: 0, y: 0 }}
          disableDragging={true}
          bounds="parent"
          enableResizing={{
            bottom: true,
          }}
          onResize={handleEditorResize}
          style={{
            background: "#0000ff",
            // display: "flex",
            // flexDirection: "column",
          }}
          minHeight={minEditorHeight}
          maxHeight={maxEditorHeight}
        >
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
        </Rnd>
        <Rnd
          size={{
            width: "100%",
            height: getTerminalHeight(),
          }}
          position={{ x: 0, y: heightEditor }}
          bounds="parent"
          style={{
            background: "#252526",
            display: "flex",
            flexDirection: "column",
          }}
          disableDragging={true}
          enableResizing={false}
        ></Rnd>
      </Rnd>
    </div>
  );
};

export default MonacoEditor;
