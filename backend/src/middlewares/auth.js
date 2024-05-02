import jwt from "jsonwebtoken";

// Middleware for verifying tokens
export function authenticateToken(req, res, next) {
  let token = "";
  if (req.token) {
    token = req.token;
  }

  if (token == null)
    return res.status(401).json({
      success: false,
      msg: "authentication failed. send the jwt with requests OR login first if not done yet.",
    });

  console.log("authenticateToken -> ", { token });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    console.log("authenticateToken -> jwt.verify -> ", { user });
    req.username = user.userId;
    if (err)
      return res
        .status(403)
        .json({ success: false, msg: "authentication failed. invalid jwt" });
    next();
  });
}
