import Editor from "@monaco-editor/react";
import { CodeEditorProps } from "../../models/interfaces";

const CodeEditor: React.FC<CodeEditorProps> = ({
  focusedFileName,
  handleCodeChange,
  handleEditorMount,
  filesData,
}) => {
  console.log("CodeEditor rendered");
  console.log("filesData -> ", filesData);
  if (focusedFileName && filesData)
    console.log(filesData[focusedFileName].value);
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