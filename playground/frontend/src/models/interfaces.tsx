import { Monaco } from "@monaco-editor/react";
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
  filesData: Record<string, FileDescription> | undefined;
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
  setFocusedTabName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFocusedFileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  focusedFileName: string | undefined;
  filesData: Record<string, FileDescription> | undefined;
}

export interface TabsProps {
  tabNames: string[];
  focusedTabName: string | undefined;
  handleTabClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

export interface PreviewProps {
  filesData: Record<string, FileDescription> | undefined;
}

export interface LoginProps {
  setNeedToRegister: (value: boolean) => void;
  setHasUserLoggedIn: (value: boolean) => void;
  setFilesData: (value: Record<string, FileDescription> | undefined) => void;
}

export interface RegisterProps {
  setNeedToRegister: (value: boolean) => void;
}

export interface MonacoEditorProps {
  filesData: Record<string, FileDescription> | undefined;
  setFilesData: React.Dispatch<
    React.SetStateAction<Record<string, FileDescription> | undefined>
  >;
}

export interface TerminalXTermProps {
  setFilesData: (data: Record<string, FileDescription> | undefined) => void;
}
