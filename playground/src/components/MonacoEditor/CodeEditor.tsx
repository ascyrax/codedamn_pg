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
  isAnOpenedTab: boolean;
}

interface CodeEditorProps {
  focusedFileName: string | undefined;
  focusedTabName: string | undefined;
  handleCodeChange: (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => void;
  handleEditorMount: (
    editorInstance: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) => void;
  filesData: Record<string, FileDescription>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  focusedFileName,
  focusedTabName,
  handleCodeChange,
  handleEditorMount,
  filesData,
}) => {
  return (
    <div id="codeEditor">
      <Editor
        height="100vh"
        theme="vs-dark"
        path={focusedFileName}
        defaultLanguage={
          focusedFileName ? filesData[focusedFileName].language : "javascript"
        }
        defaultValue={focusedFileName ? filesData[focusedFileName].value : ""}
        onChange={handleCodeChange}
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default CodeEditor;

// import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
// import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
// import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
// import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// self.MonacoEnvironment = {
//   getWorker(_, label) {
//     if (label === "json") {
//       return new jsonWorker();
//     }
//     if (label === "css" || label === "scss" || label === "less") {
//       return new cssWorker();
//     }
//     if (label === "html" || label === "handlebars" || label === "razor") {
//       return new htmlWorker();
//     }
//     if (label === "typescript" || label === "javascript") {
//       return new tsWorker();
//     }
//     return new editorWorker();
//   },
// };

// loader.config({ monaco });

// loader.init().then(/* ... */);
