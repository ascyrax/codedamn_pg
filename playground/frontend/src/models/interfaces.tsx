import { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as interfaces from "../models/interfaces";
import { TreeData } from "@atlaskit/tree";

export interface FileDescription {
  name: string;
  language: string;
  value: string;
  isAnOpenedTab: boolean;
  _v: number;
  _id: string;
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
  filesData: Record<string, interfaces.FileDescription> | undefined;
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
