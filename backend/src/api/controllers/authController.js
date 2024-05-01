import { UserModel } from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {createUser} from "../services/userServices.js"

export async function handleRegister(req, res) {
  if (!req.body || !req.body.body) {
    return res.json({
      success: true,
      token,
      msg: "Could not register. insufficient data from the client side",
    });
  }

  let { username, password } = req.body.body;
  try {
    // Generate a salt and hash on separate function calls
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally enough
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCreation = await createUser({ username, hashedPassword });
    if (userCreation.success) {
      res.send({ success: true, msg: userCreation.msg });
    } else {
      res.send({ success: false, msg: userCreation.msg });
    }
  } catch (err) {
    console.error("could not create user. internal server error", err);
  }
}

// Authentication endpoint
export async function handleLogin(req, res) {
  if (!req.body || !req.body.body) {
    return res.json({
      success: true,
      token,
      msg: "Could not login. insufficient data from the client side",
    });
  }

  const { username, password } = req.body.body;
  try {
    const user = await UserModel.findOne({ username });
    if (user) {
      try {
        if (bcrypt.compare(password, user.password)) {
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
    throw new Error(":( Login Failed");
  }
}

