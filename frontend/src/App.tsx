import { useState, useEffect } from "react";
import MonacoEditor from "./components/features/MonacoEditor.tsx";
import Register from "./components/layout/Register.tsx";
import Login from "./components/layout/Login.tsx";
import { FileDescription, credentials } from "./models/interfaces.tsx";
import "./styles/app.css";
import { getFileData } from "./services/services.tsx";
import { TreeData } from "@atlaskit/tree";
import { initialData } from "./utils/utils.tsx";

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
  const [isInitialFocusedFileLoad, setInitialFocusedFileLoad] =
    useState<boolean>(true);
  const [isInitialTabsLoad, setIsInitialTabsLoad] = useState<boolean>(true);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [terminalData, setTeminalData] = useState("");
  const [tree, setTree] = useState<TreeData>(initialData);

  console.log("RENDER App: ", { tree });

  // these two useEffects will only work once.
  // viz, next time the focusedTabName or the tabNames change, data fetch won't be triggered.
  useEffect(() => {
    // console.log("useEffect -> focusedTabName: ", focusedTabName);
    async function wrapperAsyncFunc() {
      await fetchInitialFileData(focusedTabName); // do this only after focusedTabName has been set
    }
    if (isInitialFocusedFileLoad && focusedTabName) {
      setInitialFocusedFileLoad(false); // we don't load the file=focusedTabName every time the focusedTabName state changes
      wrapperAsyncFunc();
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
          credentials={credentials}
          focusedTabName={focusedTabName}
          setTree={setTree}
          setWs={setWs}
          setTerminalData={setTeminalData}
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
