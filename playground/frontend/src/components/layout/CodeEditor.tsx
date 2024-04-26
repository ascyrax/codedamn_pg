import Editor, {
  DiffEditor,
  useMonaco,
  loader,
  Monaco,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as interfaces from "../../models/interfaces";

const CodeEditor: React.FC<interfaces.CodeEditorProps> = ({
  focusedFileName,
  focusedTabName,
  handleCodeChange,
  handleEditorMount,
  filesData,
}) => {
  return (
    <div id="codeEditor">
      <Editor
        height="100%"
        theme="vs-dark"
        path={focusedFileName}
        defaultLanguage={
          focusedFileName && filesData
            ? filesData[focusedFileName].language
            : "javascript"
        }
        defaultValue={
          focusedFileName && filesData ? filesData[focusedFileName].value : ""
        }
        onChange={handleCodeChange}
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default CodeEditor;
