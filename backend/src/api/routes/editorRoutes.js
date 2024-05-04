import express from "express";
import {
  getEditorData,
  setEditorData,
  getEditorTabs
} from "../controllers/editorController.js";

const editorRoutes = express.Router();

// url = /editorData

editorRoutes.get("/", getEditorData);
editorRoutes.get("/tabs", getEditorTabs);
editorRoutes.post("/", setEditorData);
// editorRoutes.post("/tabs", setEditorData);

export { editorRoutes };
