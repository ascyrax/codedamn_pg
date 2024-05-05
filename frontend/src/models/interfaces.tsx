// import { Monaco } from "@monaco-editor/react";
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
  // _v: number;
  // _id: string;
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
  focusedFileName: string | undefined;
  filesData: Record<string, FileDescription>;
  // setFilesData: (
  //   value: React.SetStateAction<Record<string, FileDescription>>
  // ) => void;
  setTabNames: (value: React.SetStateAction<string[]>) => void;
  // setTabNames: (tabNames: string[]) => void;
  setFocusedTabName: (tabName: string | undefined) => void;
  setFocusedFileName: (fileName: string | undefined) => void;
  getAndSetFileData: (fileName: string) => void;
}

export interface TabsProps {
  tabNames: string[];
  focusedTabName: string | undefined;
  // setTabNames: (tabNames: string[]) => void;
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
}

export interface LoginProps {
  credentials: credentials;
  focusedTabName: string | undefined;
  setTabNames: (value: React.SetStateAction<string[]>) => void;
  // setTabNames: (tabNames: string[]) => void;
  setNeedToRegister: (value: boolean) => void;
  setHasUserLoggedIn: (value: boolean) => void;
  // setFilesData: (data: Record<string, FileDescription> | undefined) => void;
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
  tabNames: string[];
  focusedTabName: string | undefined;
  focusedFileName: string | undefined;
  filesData: Record<string, FileDescription>;
  prevFilesData: Record<string, FileDescription>;
  // setTabNames: (tabNames: string[]) => void;
  setTabNames: (value: React.SetStateAction<string[]>) => void;

  // setFilesData: (data: Record<string, FileDescription> | undefined) => void;
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
  // setFilesData: (data: Record<string, FileDescription> | undefined) => void;
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
