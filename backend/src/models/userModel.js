import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const UserModel = mongoose.model("UserModel", userSchema);

export { UserModel };
