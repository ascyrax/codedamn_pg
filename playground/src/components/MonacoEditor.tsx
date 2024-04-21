import { useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
import Editor, {
  DiffEditor,
  useMonaco,
  loader,
  Monaco,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Define the interface for each file description
interface FileDescription {
  name: string;
  language: string;
  value: string;
}

// Assuming some example contents for each type of file
const someJSCodeExample: string = `console.log('Hello, world!');`;
const someCSSCodeExample: string = `body { background-color: #f0f0f0; }`;
const someHTMLCodeExample: string = `<html><body>Hello, world!</body></html>`;

// Define the files object with type annotations
const files: Record<string, FileDescription> = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: someJSCodeExample,
  },
  "style.css": {
    name: "style.css",
    language: "css",
    value: someCSSCodeExample,
  },
  "index.html": {
    name: "index.html",
    language: "html",
    value: someHTMLCodeExample,
  },
};

function MonacoEditor() {
  const [fileName, setFileName] = useState("script.js");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const file = files[fileName];

  function handleCodeChange(
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) {}

  function handleEditorMount(
    editorInstance: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;
  }

  return (
    <>
      <button
        disabled={fileName === "script.js"}
        onClick={() => setFileName("script.js")}
      >
        script.js
      </button>
      <button
        disabled={fileName === "style.css"}
        onClick={() => setFileName("style.css")}
      >
        style.css
      </button>
      <button
        disabled={fileName === "index.html"}
        onClick={() => setFileName("index.html")}
      >
        index.html
      </button>
      <Editor
        height="80vh"
        theme="vs-dark"
        path={file.name}
        defaultLanguage={file.language}
        defaultValue={file.value}
        onChange={handleCodeChange}
        onMount={handleEditorMount}
      />
    </>
  );
}

export default MonacoEditor;
