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
  // let [updateTree, setUpdateTree] = useState<(newTree: TreeData) => void>(
  //   (newTree: TreeData) => {
  //     console.log(tree, newTree);
  //     if (newTree && newTree.items)
  //       for (let [key, val] of Object.entries(newTree.items)) {
  //         if (key == "playground/da") console.log(key, val);
  //         if (
  //           val.isExpanded &&
  //           tree.items &&
  //           tree.items[key] &&
  //           tree.items[key].isExpanded
  //         ) {
  //           if (key) val.isExpanded = tree.items[key].isExpanded;
  //         }
  //       }
  //     setTree(newTree);
  //   }
  // );
  // console.log("RENDER App: ", { tabNames });

  useEffect(() => {
    console.log({filesData})
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
      // console.log(
      //   hasUserLoggedIn,
      //   SERVER_WSDOMAIN,
      //   SERVER_PORT,
      //   credentials.username
      // );
      ws = new WebSocket(
        `${SERVER_WSDOMAIN}:${SERVER_PORT}?username=${credentials.username}`
      );

      ws.onopen = function () {
        // console.log("connection open");
        // if (token) ws.send(JSON.stringify({ type: "token", token }));
      };

      ws.onerror = function (event) {
        console.error("WebSocket error observed by the client :)", event);
      };

      ws.onmessage = function (event) {
        // console.log("ws receive -> : ", event);
        const msg = JSON.parse(event.data);
        // console.log("ws receive -> ", msg);
        if (msg.type == "stdout" || msg.type == "stderr") {
          // console.log(msg.data);
          setTerminalData(msg.data);
        } else if (msg.type == "explorer") {
          updateTree(msg.explorerData);
        } else if (msg.sender == "chokidar") {
          const basePath = msg.volumePath;
          const filePath = msg.filePath;
          const relativePath = filePath.replace(`${basePath}`, "");
          console.log(msg, relativePath);
          if (relativePath) {
            getAndSetFileData(relativePath);
          }
        }
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed.", event);
      };

      setWs(ws);
    }

    const updateTree = (newTree: TreeData) => {
      // console.log(tree, newTree);
      for (let [key, val] of Object.entries(newTree.items)) {
        // if (key == "playground/da") console.log(key, val);
        if (
          val.isExpanded &&
          tree.items &&
          tree.items[key] &&
          tree.items[key].isExpanded
        ) {
          if (key) val.isExpanded = tree.items[key].isExpanded;
        }
      }
      setTree(newTree);
    };

    function closeWebSocket(ws: WebSocket | null) {
      if (!ws) {
        // console.log("WebSocket is not initialized.");
        return;
      }

      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          // console.log("WebSocket is still connecting.");
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

  // useEffect(() => {}, [tree]);
  // these two useEffects will only work once.
  // viz, next time the focusedTabName or the tabNames change, data fetch won't be triggered.
  useEffect(() => {
    // console.log("useEffect -> focusedTabName: ", focusedTabName);
    async function wrapperAsyncFunc() {
      await fetchInitialFileData(focusedTabName); // do this only after focusedTabName has been set
    }
    if (isInitialFocusedFileLoad && focusedTabName) {
      setIsInitialFocusedFileLoad(false); // we don't load the file=focusedTabName every time the focusedTabName state changes
      wrapperAsyncFunc();
    }
    if (focusedTabName && tabNames && !isInitialFocusedFileLoad) {
      updateEditorTabs(credentials, tabNames, focusedTabName);
    }
  }, [focusedTabName]);

  useEffect(() => {
    async function wrapperAsyncFunc(fileName: string) {
      await fetchInitialFileData(fileName);
    }
    if (isInitialTabsLoad) {
      for (let i = 0; i < tabNames.length; i++) {
        setIsInitialTabsLoad(false);
        let fileName = tabNames[i];
        if (fileName == focusedTabName) continue;
        wrapperAsyncFunc(fileName);
      }
    }
    if (focusedTabName && tabNames && !isInitialFocusedFileLoad) {
      // let serverResponse = await
      updateEditorTabs(credentials, tabNames, focusedTabName);
    }
  }, [tabNames]);

  const fetchInitialFileData = async (fileName: string | undefined) => {
    if (fileName) {
      // console.log({ fileName });
      getAndSetFileData(fileName);
    }
  };

  async function getAndSetFileData(fileName: string) {
    try {
      const response = await getFileData(fileName);
      // console.log("response Loaded: ", response);
      if (response.success && response.fileData) {
        // console.log("FETCH FILE DATA -> ", filesData);
        setFilesData((prevFilesData) => {
          return {
            ...prevFilesData,
            [fileName]: {
              ...prevFilesData[fileName],
              name: fileName,
              value: response.fileData.value,
            },
          } as Record<string, FileDescription>;
        });
        setPrevFilesData((prevFilesData) => {
          return {
            ...prevFilesData,
            [fileName]: {
              ...prevFilesData[fileName],
              name: fileName,
              value: response.fileData.value,
            },
          } as Record<string, FileDescription>;
        });
      }
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
            terminalData={terminalData}
            tabNames={tabNames}
            focusedFileName={focusedFileName}
            focusedTabName={focusedTabName}
            filesData={filesData}
            prevFilesData={prevFilesData}
            credentials={credentials}
            tree={tree}
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
