import { useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import CodeEditor from "../layout/CodeEditor";
import Explorer from "../layout/Explorer";
import Tabs from "../layout/Tabs";
import { Rnd, RndResizeCallback } from "react-rnd";
import * as utils from "../../utils/utils";
import { MonacoEditorProps, FileDescription } from "../../models/interfaces";
import { Preview } from "../layout/Preview";
import TerminalXTerm from "../layout/TerminalXTerm";

// batch update to the api endpoint

// frontend
const MonacoEditor = ({
  ws,
  previewSrc,
  terminalData,
  tabNames,
  filesData,
  prevFilesData,
  credentials,
  focusedTabName,
  focusedFileName,
  tree,
  setPreviewSrc,
  setTree,
  setCredentials,
  setFilesData,
  setPrevFilesData,
  setTabNames,
  setFocusedFileName,
  setFocusedTabName,
  getAndSetFileData,
}: MonacoEditorProps) => {
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
        <Preview
          filesData={filesData}
          previewSrc={previewSrc}
          setPreviewSrc={setPreviewSrc}
        />
      </Rnd>
    </div>
  );
};

export default MonacoEditor;
