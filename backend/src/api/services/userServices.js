import { UserModel } from "../../models/userModel.js";

export async function createUser({ username, hashedPassword }) {
  console.log("createUser", { username }, { hashedPassword });
  try {
    const foundUser = await UserModel.find({ username: username });

    if (!foundUser || foundUser.length == 0) {
      try {
        const createdUser = await UserModel.create({
          username,
          password: hashedPassword,
        });
        if (createUser)
          return {
            success: true,
            msg: ":) new user created & registered",
            user: createUser,
          };
        else {
          return {
            success: false,
            msg: ":( could not create a new user. database returned empty user",
          };
        }
      } catch (err) {
        return {
          success: false,
          msg: ":( could not create a new user. database error",
        };
      }
    } else {
      return {
        success: false,
        msg: ":( could not register. user already exists",
      };
    }
  } catch (err) {
    console.error(err);
    return { success: false, msg: ":( could not register. database error" };
  }
}
