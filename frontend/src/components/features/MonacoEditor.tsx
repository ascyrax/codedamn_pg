import { useEffect, useState } from "react";
import { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CodeEditor from "../layout/CodeEditor";
import Explorer from "../layout/Explorer";
import Tabs from "../layout/Tabs";
import { Rnd, RndResizeCallback } from "react-rnd";
import { debounce, get } from "lodash-es";
import * as utils from "../../utils/utils";
import { postCodeChange } from "../../services/services";
import { MonacoEditorProps, FileDescription } from "../../models/interfaces";
import { Preview } from "../layout/Preview";
import TerminalXTerm from "../layout/TerminalXTerm";

// batch update to the api endpoint
const batchUploadFilesData = debounce(postCodeChange, 400);

// frontend
const MonacoEditor = ({
  ws,
  terminalData,
  tabNames,
  filesData,
  prevFilesData,
  credentials,
  focusedTabName,
  focusedFileName,
  tree,
  setTree,
  setCredentials,
  setFilesData,
  setPrevFilesData,
  setTabNames,
  setFocusedFileName,
  setFocusedTabName,
  getAndSetFileData,
}: MonacoEditorProps) => {
  const [_, setFileNames] = useState<string[]>([]);

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

  useEffect(() => {
    let listFileNames: string[] = [];
    for (const [fileName, fileData] of Object.entries(filesData)) {
      listFileNames.push(fileName);
      // if (fileData.isAnOpenedTab) listTabNames.push(fileName);
    }
    setFileNames(listFileNames);
    // setTabNames(listTabNames);

    // debounce ie batch the change requests,
    // also keep a maxWait after which the function is forced to be executed
    focusedFileName &&
      batchUploadFilesData(
        filesData,
        credentials,
        focusedFileName,
        prevFilesData[focusedFileName]
          ? prevFilesData[focusedFileName].value
          : "",
        filesData[focusedFileName] ? filesData[focusedFileName].value : "",
        setPrevFilesData
      );
  }, [filesData]);

  function handleCodeChange(
    changedValue: string | undefined,
    _: monaco.editor.IModelContentChangedEvent
  ) {
    if (focusedFileName && changedValue) {
      setFilesData((prevFilesData) => {
        // if (prevFilesData)
        return {
          ...prevFilesData,
          [focusedFileName]: {
            ...prevFilesData[focusedFileName],
            value: changedValue,
          },
        } as Record<string, FileDescription>;
      });
    }
  }

  function handleTabClick(
    e: React.MouseEvent<HTMLButtonElement>,
    tabName: string,
    index: number
  ) {
    if (tabNames && tabNames[index]) {
      setFocusedTabName(tabNames[index]);
      setFocusedFileName(tabNames[index]);
    }
  }

  const handleExplorerResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    e = e;
    dir = dir;
    delta = delta;
    position = position;
    setWidthExplorer(elementRef.offsetWidth);
  };
  const handlePreviewResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    e = e;
    dir = dir;
    delta = delta;
    position = position;
    setWidthPreview(elementRef.offsetWidth);
  };

  const handleEditorResize: RndResizeCallback = (
    e,
    dir,
    elementRef,
    delta,
    position
  ) => {
    e = e;
    dir = dir;
    delta = delta;
    position = position;
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
          ws={ws}
          tabNames={tabNames}
          credentials={credentials}
          filesData={filesData}
          focusedFileName={focusedFileName}
          tree={tree}
          setTree={setTree}
          setTabNames={setTabNames}
          setFocusedTabName={setFocusedTabName}
          setFocusedFileName={setFocusedFileName}
          getAndSetFileData={getAndSetFileData}
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
            setTabNames={setTabNames}
            setFocusedTabName={setFocusedTabName}
            setFocusedFileName={setFocusedFileName}
            handleTabClick={handleTabClick}
          />
          <CodeEditor
            filesData={filesData}
            focusedFileName={focusedFileName}
            focusedTabName={focusedTabName}
            setFocusedFileName={setFocusedFileName}
            setFocusedTabName={setFocusedTabName}
            handleCodeChange={handleCodeChange}
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
          <TerminalXTerm
            ws={ws}
            terminalData={terminalData}
            credentials={credentials}
            setCredentials={setCredentials}
            setFilesData={setFilesData}
          />
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
        <Preview filesData={filesData} />
      </Rnd>
    </div>
  );
};

export default MonacoEditor;
