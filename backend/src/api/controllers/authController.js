import { UserModel } from "../../models/userModel.js";
import { UserTabsModel } from "../../models/UserTabsModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser } from "../services/userServices.js";

export async function handleRegister(req, res) {
  if (!req.body || !req.body.user) {
    return res.status(400).json({
      success: false,
      msg: "Could not register. insufficient data from the client side. provide username and password please.",
    });
  }

  let { username, password } = req.body.user;
  try {
    // Generate a salt and hash on separate function calls
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally enough
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCreation = await createUser({ username, hashedPassword });
    if (userCreation.success) {
      const tabsCreated = await createUserTabs(username);
      if (tabsCreated.success)
        res.send({ success: true, msg: userCreation.msg });
      else {
        await deleteUser(username);
        res.send({
          success: false,
          msg: "server error. could not create userTabs. hence => deleted the newly created user too. retry",
        });
      }
    } else {
      res.send({ success: false, msg: userCreation.msg });
    }
  } catch (err) {
    console.error("could not create user. internal server error", err);
  }
}

async function deleteUser(userId) {
  try {
    await UserTabsModel.findByIdAndDelete(userId);
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Failed to delete user:", error);
  }
}

async function createUserTabs(username) {
  // "playground/basic/index.html",
  // "playground/basic/style.css",
  // "playground/basic/script.js",

  let defaultTabs = [
    "playground/react/src/App.jsx",
    "playground/react/src/App.css",
    "playground/react/src/main.jsx",
    "playground/react/index.html",
  ];
  try {
    let tabs = await UserTabsModel.create({
      username,
      tabs: defaultTabs,
      focusedTabName: defaultTabs[0],
    });
    if (tabs) {
      return { success: true };
    } else {
      console.error("could not create tabs. internal server error", err);
      return { success: false };
    }
  } catch (err) {
    console.error("could not create tabs. internal server error", err);
    return { success: false };
  }
}

// Authentication endpoint
export async function handleLogin(req, res) {
  // console.log(handleLogin.name, req.url);
  if (!req.body || !req.body.credentials) {
    return res.json({
      success: false,
      msg: "Could not login. insufficient data from the client side",
    });
  }

  const { username, password } = req.body.credentials;

  try {
    const user = await UserModel.findOne({ username });
    if (user) {
      try {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign(
            { userId: user.username },
            process.env.SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          // Set a cookie
          return res
            .status(200)
            .cookie("token", token, {
              maxAge: 300000, // Set cookie expiry time (300 seconds)
              httpOnly: true, // The cookie is only accessible by the web server
              secure: false, // The cookie will only be sent over HTTPS
              sameSite: "Lax",
            })
            .json({
              success: true,
              token,
              msg: "Login Successful. please accept the jwt :)",
            });
        } else {
          return res
            .status(401)
            .json({ success: false, msg: "Login failed. wrong password" });
        }
      } catch {
        return res
          .status(500)
          .json({ success: false, msg: "Internal server error" });
      }
    } else {
      return res
        .status(401)
        .json({ success: false, msg: "Login failed. user does not exist." });
    }
  } catch (err) {
    console.error("login failed. user could not be found", err);
    return res.status(401).json({
      success: false,
      msg: "login failed. user could not be found",
    });
  }
}
