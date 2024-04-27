import Editor from "@monaco-editor/react";
import * as interfaces from "../../models/interfaces";

const CodeEditor: React.FC<interfaces.CodeEditorProps> = ({
  focusedFileName,
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
