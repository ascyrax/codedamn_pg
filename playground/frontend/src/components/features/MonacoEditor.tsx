import { useEffect, useRef, useState } from "react";
import Editor, {
  DiffEditor,
  useMonaco,
  loader,
  Monaco,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CodeEditor from "../layout/CodeEditor";
import Explorer from "../layout/Explorer";
import Tabs from "../layout/Tabs";
import { Rnd, RndResizeCallback } from "react-rnd";
import { debounce } from "lodash-es";
import axios from "axios";
import { FileDescription } from "../../models/interfaces";
import * as utils from "../../utils/utils";
import * as services from "../../services/services";
import * as interfaces from "../../models/interfaces";
import Preview from "../layout/Preview";
import TerminalXTerm from "../layout/TerminalXTerm";

// frontend
const MonacoEditor: React.FC = () => {
  const [filesData, setFilesData] =
    useState<Record<string, interfaces.FileDescription>>();
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [focusedTabName, setFocusedTabName] = useState<string>();
  const [focusedFileName, setFocusedFileName] = useState<string>();
  // const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  // const monacoRef = useRef<Monaco | null>(null);

  // for resizing the explorer & the editor & the preview
  const [widthExplorer, setWidthExplorer] = useState<number>(
    utils.initialExplorerWidth
  );
  const [heightEditor, setheightEditor] = useState<number>(
    utils.initialEditorHeight
  );
  const [widthPreview, setWidthPreview] = useState<number>(
    utils.initialPreviewWidth
  );

  // batch update to the api endpoint
  const batchUpdate = debounce(services.postCodeChange, 1000);

  useEffect(() => {
    // make a get request to the backend for filesData
    const fetchEditorData = async () => {
      try {
        const responseData = await services.getEditorData();
        // console.log(responseData);
        if (responseData) {
          setFilesData(responseData);
        }
      } catch (error) {
        console.error("Error fetching editor data:", error);
      }
    };

    fetchEditorData();
  }, []);

  useEffect(() => {
    if (filesData) {
      console.log(filesData);
      let listFileNames: string[] = [],
        listTabNames: string[] = [];
      for (const [fileName, fileData] of Object.entries(filesData)) {
        listFileNames.push(fileName);
        if (fileData.isAnOpenedTab) listTabNames.push(fileName);
      }
      setFileNames(listFileNames);
      setTabNames(listTabNames);
    }
  }, [filesData]);

  function handleCodeChange(
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) {
    if (filesData && focusedFileName && value) {
      filesData[focusedFileName].value = value;
      // debounce ie batch the change requests,
      // also keep a maxWait after which the function is forced to be executed
      batchUpdate(filesData);
    }
  }

  function handleEditorMount(
    editorInstance: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) {
    // editorRef.current = editorInstance;
    // monacoRef.current = monacoInstance;
  }

  function handleTabClick(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.target as HTMLButtonElement;
    setFocusedTabName(target.innerText);
    setFocusedFileName(target.innerText);
  }

  const handleExplorerResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    setWidthExplorer(elementRef.offsetWidth);
  };
  const handlePreviewResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    setWidthPreview(elementRef.offsetWidth);
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

  return (
    <div id="monacoEditor">
      {/* explorer */}
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
        minWidth={utils.minExplorerWidth}
        maxWidth={utils.maxExplorerWidth}
      >
        <Explorer
          setFocusedTabName={setFocusedTabName}
          setFocusedFileName={setFocusedFileName}
          focusedFileName={focusedFileName}
        />
      </Rnd>

      <Rnd
        size={{
          width: utils.getEditorWidth(widthExplorer, widthPreview),
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
        {/* tabs + codeEditor */}
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
          minHeight={utils.minEditorHeight}
          maxHeight={utils.maxEditorHeight}
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

        {/* Terminal */}
        <Rnd
          size={{
            width: "100%",
            height: utils.getTerminalHeight(heightEditor),
          }}
          position={{ x: 0, y: heightEditor }}
          bounds="parent"
          style={{
            background: "#555",
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid #555",
            paddingTop: "3px",
          }}
          disableDragging={true}
          enableResizing={false}
        >
          <TerminalXTerm />
        </Rnd>
      </Rnd>

      {/* // PREVIEW */}
      <Rnd
        size={{
          width: widthPreview,
          height: "100vh",
        }}
        position={{
          x: widthExplorer + utils.getEditorWidth(widthExplorer, widthPreview),
          y: 0,
        }}
        bounds="parent"
        enableResizing={{
          left: true,
        }}
        onResize={handlePreviewResize}
        disableDragging={true}
      >
        <Preview />
      </Rnd>
    </div>
  );
};

export default MonacoEditor;
