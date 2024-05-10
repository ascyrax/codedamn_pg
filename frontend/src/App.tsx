import { useState, useEffect } from "react";
import MonacoEditor from "./components/features/MonacoEditor.tsx";
import Register from "./components/layout/Register.tsx";
import Login from "./components/layout/Login.tsx";
import { FileDescription, credentials } from "./models/interfaces.tsx";
import "./styles/app.css";
import {
  getFileData,
  updateEditorTabs,
  postCodeChange,
} from "./services/services.tsx";
import { debounce } from "lodash-es";
import { TreeData } from "@atlaskit/tree";
import { initialData, SERVER_WSDOMAIN, SERVER_PORT } from "./utils/utils.tsx";

const batchUploadFilesData = debounce(postCodeChange, 400);

function App() {
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [hasUserLoggedIn, setHasUserLoggedIn] = useState(false);
  const [needToRegister, setNeedToRegister] = useState(false);
  const [filesData, setFilesData] = useState<Record<string, FileDescription>>(
    {}
  );
  const [prevFilesData, setPrevFilesData] = useState<
    Record<string, FileDescription>
  >({});
  const [credentials, setCredentials] = useState<credentials>({
    username: "",
    password: "",
  });
  const [focusedTabName, setFocusedTabName] = useState<string>();
  const [focusedFileName, setFocusedFileName] = useState<string>();
  const [isInitialFocusedFileLoad, setIsInitialFocusedFileLoad] =
    useState<boolean>(true);
  const [isInitialTabsLoad, setIsInitialTabsLoad] = useState<boolean>(true);

  let [ws, setWs] = useState<WebSocket | null>(null);
  const [terminalData, setTerminalData] = useState("");
  const [tree, setTree] = useState<TreeData>(initialData);
  const [filesToLoad, setFilesToLoad] = useState<string[]>([]);
  const [TabToRemove, setTabToRemove] = useState<string>("");
  const [treeUpdates, setTreeUpdates] = useState<TreeData>();
  let [previewSrc, setPreviewSrc] = useState("http://localhost:55002");

  const isAnOpenedTab = (relativePath: string) => {
    for (let i = 0; i < tabNames.length; i++) {
      if (tabNames[i].includes(relativePath)) return true;
    }
    return false;
  };

  useEffect(() => {
    for (let i = 0; i < filesToLoad.length; i++) {
      let fileName = filesToLoad[i];
      if (isAnOpenedTab(fileName)) {
        getAndSetFileData(fileName);
      }
    }
    if (filesToLoad.length > 0) setFilesToLoad([]);
  }, [filesToLoad]);

  useEffect(() => {
    // update tabs -> whatif a file opened in the tab is removed using xterm
    let arrTabs = [...tabNames];
    arrTabs = arrTabs.filter((tabName) => {
      console.log(tabName === TabToRemove);
      return !(tabName === TabToRemove);
    });
    setTabNames(arrTabs);

    if (TabToRemove) setTabToRemove("");
  }, [TabToRemove]);

  useEffect(() => {
    treeUpdates && updateTree(treeUpdates);
    if (treeUpdates && !(Object.keys(treeUpdates).length === 0))
      setTreeUpdates(undefined);
  }, [treeUpdates]);

  const updateTree = (newTree: TreeData) => {
    for (let [key, val] of Object.entries(newTree.items)) {
      if (tree.items && tree.items[key]) {
        val.isExpanded = tree.items[key].isExpanded;
      }
    }
    setTree(newTree);
  };

  useEffect(() => {
    console.log({ filesData });
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

  useEffect(() => {
    if (hasUserLoggedIn) {
      ws = new WebSocket(
        `${SERVER_WSDOMAIN}:${SERVER_PORT}?username=${credentials.username}`
      );

      ws.onopen = function () {};

      ws.onerror = function (event) {
        console.error("WebSocket error observed by the client :)", event);
      };

      ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        if (msg.type == "stdout" || msg.type == "stderr") {
          setTerminalData(msg.data);
        } else if (msg.type == "explorer") {
          setTreeUpdates(msg.explorerData);
        } else if (msg.sender == "chokidar") {
          const basePath = msg.volumePath;
          const filePath = msg.filePath;
          const relativePath = filePath.replace(`${basePath}`, "");
          if (relativePath) {
            if (msg.type == "unlink") {
              setTabToRemove(`playground${relativePath}`);
            } else {
              setFilesToLoad((prevFilesToLoad) => {
                return [...prevFilesToLoad, `playground${relativePath}`];
              });
            }
          }
        } else if (msg.type == "exposedPorts") {
          setPreviewSrc(`http://localhost:${msg.previewSrc}`);
        }
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed.", event);
      };

      setWs(ws);
    }

    function closeWebSocket(ws: WebSocket | null) {
      if (!ws) {
        return;
      }

      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          break;
        case WebSocket.OPEN:
          console.log("Closing WebSocket.");
          ws.close();
          break;
        case WebSocket.CLOSING:
          console.log("WebSocket is already closing.");
          break;
        case WebSocket.CLOSED:
          console.log("WebSocket is already closed.");
          break;
        default:
          console.error("Unknown WebSocket state.");
      }
    }

    return () => {
      closeWebSocket(ws);
    };
  }, [hasUserLoggedIn]);

  useEffect(() => {
    async function wrapperAsyncFunc() {}
    if (isInitialFocusedFileLoad && focusedTabName) {
      setIsInitialFocusedFileLoad(false); // we don't load the file=focusedTabName every time the focusedTabName state changes
      wrapperAsyncFunc();
    }
    if (focusedTabName && tabNames && !isInitialFocusedFileLoad) {
      updateEditorTabs(credentials, tabNames, focusedTabName);
    }
  }, [focusedTabName]);

  useEffect(() => {
    if (isInitialTabsLoad) {
      for (let i = 0; i < tabNames.length; i++) {
        setIsInitialTabsLoad(false);
        let fileName = tabNames[i];
        if (fileName == focusedTabName) continue;
      }
    }
    if (focusedTabName && tabNames && !isInitialFocusedFileLoad) {
      // let serverResponse = await
      updateEditorTabs(credentials, tabNames, focusedTabName);
    }
    setFilesToLoad(tabNames);
  }, [tabNames]);

  async function getAndSetFileData(fileName: string) {
    try {
      await getFileData(
        fileName,
        credentials,
        setFilesData,
        setPrevFilesData
      );
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  }

  return (
    <>
      {hasUserLoggedIn ? (
        <div className="MonacoEditor">
          <MonacoEditor
            ws={ws}
            previewSrc={previewSrc}
            terminalData={terminalData}
            tabNames={tabNames}
            focusedFileName={focusedFileName}
            focusedTabName={focusedTabName}
            filesData={filesData}
            prevFilesData={prevFilesData}
            credentials={credentials}
            tree={tree}
            setPreviewSrc={setPreviewSrc}
            setTree={setTree}
            setFocusedFileName={setFocusedFileName}
            setFocusedTabName={setFocusedTabName}
            setTabNames={setTabNames}
            setFilesData={setFilesData}
            setPrevFilesData={setPrevFilesData}
            setCredentials={setCredentials}
            getAndSetFileData={getAndSetFileData}
          ></MonacoEditor>
        </div>
      ) : needToRegister ? (
        <Register setNeedToRegister={setNeedToRegister} />
      ) : (
        <Login
          ws={ws}
          tree={tree}
          credentials={credentials}
          focusedTabName={focusedTabName}
          setTree={setTree}
          setWs={setWs}
          setTerminalData={setTerminalData}
          setNeedToRegister={setNeedToRegister}
          setHasUserLoggedIn={setHasUserLoggedIn}
          setFilesData={setFilesData}
          setCredentials={setCredentials}
          setTabNames={setTabNames}
          setFocusedTabName={setFocusedTabName}
          setFocusedFileName={setFocusedFileName}
        />
      )}
    </>
  );
}

export default App;
