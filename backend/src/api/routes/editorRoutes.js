import express from "express";
import {
  getEditorData,
  setEditorData,
} from "../controllers/editorController.js";

const editorRoutes = express.Router();

// url = /editorData

editorRoutes.get("/", getEditorData);
editorRoutes.post("/", setEditorData);

export { editorRoutes };
