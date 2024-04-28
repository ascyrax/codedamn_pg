import * as interfaces from "../models/interfaces";

export const initialExplorerWidth = 250,
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

export const initialData: interfaces.CustomTreeData = {
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
      isExpanded: false,
    },
    outline: {
      id: "outline",
      children: [],
      data: { title: "Outline", type: "folder" },
      isExpanded: false,
    },
    playground: {
      id: "playground",
      children: ["index.html", "style.css", "script.js"],
      data: { title: "playground", type: "folder" },
    },
    "index.html": {
      id: "index.html",
      children: [],
      data: { title: "index.html", type: "file" },
    },
    "style.css": {
      id: "style.css",
      children: [],
      data: { title: "style.css", type: "file" },
    },
    "script.js": {
      id: "script.js",
      children: [],
      data: { title: "script.js", type: "file" },
    },
  },
};

// export let filesData: Record<string, interfaces.FileDescription> = {
//   "script.js": {
//     name: "script.js",
//     language: "javascript",
//     value: `console.log('Hello, world!');`,
//     isAnOpenedTab: true,
//   },
//   "style.css": {
//     name: "style.css",
//     language: "css",
//     value: `body { background-color: #f0f0f0; }`,
//     isAnOpenedTab: true,
//   },
//   "index.html": {
//     name: "index.html",
//     language: "html",
//     value: `<html><body>Hello, world!</body></html>`,
//     isAnOpenedTab: true,
//   },
// };

export const convertFilesData = (responseData: interfaces.FileDescription) => {
  let filesData = {};
  for (const [_, val] of Object.entries(responseData)) {
    let fileName = val.name;
    filesData = { ...filesData, [fileName]: val };
  }
  return filesData;
};
