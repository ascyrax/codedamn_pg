import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique in the collection
  },
  email: String,
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("UserModel", userSchema);

export { UserModel };
