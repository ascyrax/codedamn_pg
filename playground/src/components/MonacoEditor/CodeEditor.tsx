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
        height="100%"
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
