import mongoose from "mongoose";

const userTabsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique in the collection
  },
  tabs: [String],
  focusedTabName: String,
});

const UserTabsModel = mongoose.model("UserTabsModel", userTabsSchema);

export { UserTabsModel };
