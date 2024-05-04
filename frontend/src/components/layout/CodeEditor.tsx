import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { monaco } from "react-monaco-editor";
import { CodeEditorProps } from "../../models/interfaces";
import { useEffect, useState } from "react";

const CodeEditor: React.FC<CodeEditorProps> = ({
  filesData,
  focusedTabName,
  focusedFileName,
  setFocusedFileName,
  setFocusedTabName,
  handleCodeChange,
}) => {
  const [language, setLanguage] = useState("");
  const [value, setValue] = useState("Loading...");

  useEffect(() => {
    console.log("useEffect -> codeEditor: ");
    if (filesData) {
      if (!focusedFileName) setFocusedFileName(Object.keys(filesData)[0]);
      if (!focusedTabName) setFocusedTabName(Object.keys(filesData)[0]);

      if (focusedFileName) {
        setLanguage(filesData[focusedFileName].language);
        setValue(filesData[focusedFileName].value);
      }
    }
  }, [filesData]);

  useEffect(() => {
    console.log("useEffect -> focusedFileName: ", focusedFileName);
    if (focusedFileName && filesData) {
      if (filesData[focusedFileName]) {
        setLanguage(filesData[focusedFileName].language);
        setValue(filesData[focusedFileName].value);
      }
    }
  }, [focusedFileName]);

  const options: editor.IStandaloneEditorConstructionOptions | undefined = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
  };

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editor.focus();
    // Customizing the editor settings to enable linting
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });
  };

  return (
    <div id="codeEditor">
      <Editor
        options={options}
        height="100%"
        theme="vs-dark"
        path={focusedFileName}
        // defaultLanguage={
        //   focusedFileName && filesData
        //     ? filesData[focusedFileName].language
        //     : "javascript"
        // }
        // defaultValue={
        //   focusedFileName && filesData ? filesData[focusedFileName].value : ""
        // }
        value={value}
        language={language}
        onChange={handleCodeChange}
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default CodeEditor;
