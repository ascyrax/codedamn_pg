import mongoose from "mongoose";

const fileDataSchema = new mongoose.Schema({
  name: String,
  language: String,
  isAnOpenedTab: Boolean,
  value: String,
});

const FileDataModel = mongoose.model("FileDataModel", fileDataSchema);

export { FileDataModel };
