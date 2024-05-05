import express from "express";
import {
  // getEditorData,
  setEditorData,
  getEditorTabs,
  getFileData
} from "../controllers/editorController.js";

const editorRoutes = express.Router();

// url = /editorData

// editorRoutes.get("/", getEditorData);
editorRoutes.get("/tabs", getEditorTabs);
editorRoutes.get("/file", getFileData);
editorRoutes.post("/", setEditorData);
// editorRoutes.post("/tabs", setEditorData);

export { editorRoutes };
