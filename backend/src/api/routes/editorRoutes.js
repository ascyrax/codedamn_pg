import express from "express";
import {
  // getEditorData,
  setFileData,
  getEditorTabs,
  getFileData,
  updateEditorTabs
} from "../controllers/editorController.js";

const editorRoutes = express.Router();

// url = /editorData

// editorRoutes.get("/", getEditorData);
editorRoutes.get("/tabs", getEditorTabs);
editorRoutes.post("/tabs", updateEditorTabs);
editorRoutes.get("/file", getFileData);
editorRoutes.post("/file", setFileData);
// editorRoutes.post("/tabs", setEditorData);

export { editorRoutes };
