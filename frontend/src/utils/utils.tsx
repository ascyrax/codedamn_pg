import { CustomTreeData, FileDescription } from "../models/interfaces";

// export const SERVER_DOMAIN = "http://localhost";
// export const SERVER_WSDOMAIN = "ws://localhost";
export const SERVER_PORT = "3000";
export const SERVER_WSDOMAIN = "ws://52.66.252.149"; //Public IPv4 DNS
export const SERVER_DOMAIN = "http://52.66.252.149"; //Public IPv4 DNS

export const initialExplorerWidth = 350,
  initialEditorHeight = 700,
  initialPreviewWidth = 350;

export const monacoEditor = document.getElementById("monacoEditor");

// terminal
export const minTerminalHeight = 100;

// editor
export const minEditorWidth = 100,
  minEditorHeight = 100,
  maxEditorHeight =
    (monacoEditor ? monacoEditor.offsetHeight : window.innerHeight) -
    minTerminalHeight;

// explorer
export const minExplorerWidth = 100,
  maxExplorerWidth =
    (monacoEditor ? monacoEditor.offsetWidth : window.innerWidth) -
    minEditorWidth;

// preview
export const minPreviewWidth = 100;

export const getEditorWidth = (widthExplorer: number, widthPreview: number) => {
  let result =
    (monacoEditor ? monacoEditor.offsetWidth : window.innerWidth) -
    widthExplorer -
    widthPreview;
  return result;
};
export const getTerminalHeight = (heightEditor: number) => {
  let result = monacoEditor
    ? monacoEditor.offsetHeight - heightEditor
    : window.innerHeight - heightEditor;
  return result;
};

export const initialData: CustomTreeData = {
  rootId: "root",
  items: {
    root: {
      id: "root",
      children: ["workspace", "outline"],
      data: { title: "Root", type: "folder" },
      isExpanded: true,
    },
    workspace: {
      id: "workspace",
      children: ["playground"],
      data: { title: "Workspace", type: "folder" },
      isExpanded: true,
    },
    outline: {
      id: "outline",
      children: [],
      data: { title: "Outline", type: "folder" },
      isExpanded: false,
    },
    playground: {
      id: "playground",
      children: [],
      // children: ["index.html", "style.css", "script.js"],
      data: { title: "playground", type: "folder" },
      isExpanded: true,
    },
  },
};

export const convertFilesData = (responseData: FileDescription) => {
  let filesData = {};
  for (const [_, val] of Object.entries(responseData)) {
    let fileName = val.name;
    filesData = { ...filesData, [fileName]: val };
  }
  return filesData;
};
