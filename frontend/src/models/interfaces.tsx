import * as monaco from "monaco-editor";
import { TreeData } from "@atlaskit/tree";

export interface user {
  username: string;
  email: string;
  password: string;
}

export interface credentials {
  username: string;
  password: string;
}

export interface FileDescription {
  name: string;
  language: string;
  value: string;
  isAnOpenedTab: boolean;
}

export interface CodeEditorProps {
  filesData: Record<string, FileDescription>;
  focusedFileName: string | undefined;
  focusedTabName: string | undefined;
  setFocusedFileName: (fileName: string | undefined) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  handleCodeChange: (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => void;
}

export interface FileItemData {
  title: string;
  type: "file" | "folder";
}

export interface CustomTreeData extends TreeData {
  items: {
    [key: string]: {
      id: string;
      children: string[];
      data: FileItemData;
      isExpanded?: boolean;
      isChildrenLoading?: boolean;
      hasChildren?: boolean;
    };
  };
}

export interface ExplorerProps {
  ws: WebSocket | null;
  tabNames: string[];
  credentials: credentials;

  focusedFileName: string | undefined;
  filesData: Record<string, FileDescription>;
  tree: TreeData;
  setTree: (value: TreeData) => void;
  setTabNames: (value: React.SetStateAction<string[]>) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  setFocusedFileName: (fileName: string | undefined) => void;
  getAndSetFileData: (fileName: string) => void;
}

export interface TabsProps {
  tabNames: string[];
  focusedTabName: string | undefined;
  setTabNames: (value: React.SetStateAction<string[]>) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  setFocusedFileName: (fileName: string | undefined) => void;
  handleTabClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tabName: string,
    index: number
  ) => void;
}

export interface PreviewProps {
  filesData: Record<string, FileDescription>;
  previewSrc: string;
  setPreviewSrc: (val: string) => void;
}

export interface LoginProps {
  ws: WebSocket | null;
  credentials: credentials;
  focusedTabName: string | undefined;
  tree: TreeData;
  setTree: (value: TreeData) => void;
  setTerminalData: (value: string) => void;
  setWs: (ws: React.SetStateAction<WebSocket | null>) => void;
  setTabNames: (value: React.SetStateAction<string[]>) => void;
  setNeedToRegister: (value: boolean) => void;
  setHasUserLoggedIn: (value: boolean) => void;
  setFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void;

  setCredentials: (value: credentials) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  setFocusedFileName: (fileName: string | undefined) => void;
}

export interface RegisterProps {
  setNeedToRegister: (value: boolean) => void;
}

export interface MonacoEditorProps {
  previewSrc: string;
  ws: WebSocket | null;
  terminalData: string;
  tabNames: string[];
  focusedTabName: string | undefined;
  focusedFileName: string | undefined;
  filesData: Record<string, FileDescription>;
  prevFilesData: Record<string, FileDescription>;
  setPreviewSrc: (val: string) => void;
  tree: TreeData;
  setTree: (value: TreeData) => void;
  setTabNames: (value: React.SetStateAction<string[]>) => void;

  setFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void;
  setPrevFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void;
  credentials: credentials;
  setCredentials: (value: credentials) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  setFocusedFileName: (fileName: string | undefined) => void;
  getAndSetFileData: (fileName: string) => void;
}

export interface TerminalXTermProps {
  terminalData: string;
  ws: WebSocket | null;
  setFilesData: (
    value: React.SetStateAction<Record<string, FileDescription>>
  ) => void;

  credentials: credentials;
  setCredentials: (value: credentials) => void;
}

export interface LoginServerResponse {
  msg: "string";
  success: boolean;
  token: "string";
}

export interface chokidarMsg {
  type: string;
  description: string;
  sender: string;
  filePath: string;
  dirPath: string;
  volumePath: string; // basePath
}
