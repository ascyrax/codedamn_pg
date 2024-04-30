import { UserModel } from "../../models/userModel.js";
import { setCurrentUsername } from "../../server.js";

let users = [];
async function populateUsers() {
  try {
    const foundUsers = await UserModel.find();
    users = foundUsers;
  } catch (err) {
    console.error(
      ":( could not populate users array using the database. database error",
      err
    );
  }
}
populateUsers();

export async function handleRegister(req, res) {
  let user = req.body.body;
  const userCreation = await createUser(user);
  if (userCreation.success) {
    populateUsers();
    res.send({ success: true, msg: userCreation.msg });
  } else {
    res.send({ success: false, msg: userCreation.msg });
  }
}

export function handleLogin(req, res) {
  // console.log("handleLogin")
  let credentials = req.body.body;
  if (isUserRegistered(credentials)) {
    // Set a cookie
    res.cookie("username", credentials.username, {
      maxAge: 300000, // Set cookie expiry time (300 seconds)
      httpOnly: true, // The cookie is only accessible by the web server
      secure: false, // The cookie will only be sent over HTTPS
      sameSite: "Lax",
    });
    res.cookie("password", credentials.password, {
      maxAge: 300000, // Set cookie expiry time (300 seconds)
      httpOnly: true, // The cookie is only accessible by the web server
      secure: false, // The cookie will only be sent over HTTPS
      sameSite: "Lax",
    });
    setCurrentUsername(credentials.username);
    res.send({ success: true, msg: ":) login successful + cookie set." });
    return;
  }
  res.send({
    success: false,
    msg: ":( couldn't login. try registering maybe.",
  });
}

export function isUserRegistered(credentials) {
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (
      user.username === credentials.username &&
      user.password === credentials.password
    ) {
      return true;
    }
  }

  return false;
}

async function createUser(user) {
  try {
    const foundUser = await UserModel.find({ username: user.username });
    if (foundUser.length == 0) {
      try {
        const createdUser = await UserModel.create(user);
        if (createUser)
          return {
            success: true,
            msg: ":) new user created & registered",
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
