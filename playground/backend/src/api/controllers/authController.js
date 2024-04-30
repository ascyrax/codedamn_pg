let users = [{ username: "a", password: "a" }];

export function handleRegister(req, res) {
  let user = req.body.body;
  console.log(user);
  users.push(user);
  res.send({ success: true, msg: ":) registration successful" });
  // res.send({ success: false, msg: ":( could not register" });
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
    res.send({ success: true, msg: ":) login successful + cookie set." });
    return;
  }
  res.send({ success: false, msg: ":( couldn't login. try registering maybe." });
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
