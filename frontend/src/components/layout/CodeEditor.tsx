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
    if (filesData) {
      if (!focusedFileName) setFocusedFileName(Object.keys(filesData)[0]);
      if (!focusedTabName) setFocusedTabName(Object.keys(filesData)[0]);

      if (focusedFileName && filesData[focusedFileName]) {
        setLanguage(filesData[focusedFileName].language);
        setValue(filesData[focusedFileName].value);
      }
    }
  }, [filesData]);

  useEffect(() => {
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
    setupMonacoEnvironment(monaco);
  };

  // Setup TypeScript environment for Monaco
  function setupMonacoEnvironment(monaco: Monaco) {
    // Customizing the editor settings to enable linting
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });


     // Set default compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowSyntheticDefaultImports: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowJs: true,
    checkJs: false,
    strict: true,
  });

  // Add React and ReactDOM typings
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare module 'react' {
      export = React;
      const React: any;
    }
    `,
    'file:///node_modules/@types/react/index.d.ts'
  );

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare module 'react-dom' {
      export = ReactDOM;
      const ReactDOM: any;
    }
    `,
    'file:///node_modules/@types/react-dom/index.d.ts'
  );

  // Add typing declarations for CSS files
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare module '*.css' {
      const content: { [className: string]: string };
      export default content;
    }
    `,
    'file:///types/css.d.ts'
  );

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowSyntheticDefaultImports: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      checkJs: false,
      strict: true,
    });

    // Add React typings
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
    declare module 'react' {
      export = React;
      const React: any;
    }
    `,
      "file:///node_modules/@types/react/index.d.ts"
    );

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
    declare module 'react-dom' {
      export = ReactDOM;
      const ReactDOM: any;
    }
    `,
      "file:///node_modules/@types/react-dom/index.d.ts"
    );
  }

  return (
    <div id="codeEditor">
      <Editor
        options={options}
        height="100%"
        theme="vs-dark"
        path={focusedFileName}
        value={value}
        language={language}
        onChange={handleCodeChange}
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default CodeEditor;
