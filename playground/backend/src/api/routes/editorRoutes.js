import express from "express";
import {
  getEditorData,
  setEditorData,
} from "../controllers/editorController.js";

const editorRoutes = express.Router();

// app.use("/editordata", editorRoutes);

editorRoutes.get("/", getEditorData);
editorRoutes.post("/", setEditorData);

export { editorRoutes };
