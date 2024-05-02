import jwt from "jsonwebtoken";

// Middleware for verifying tokens
export function authenticateToken(req, res, next) {
  let token = "";
  if (req.headers) {
    token = req.headers["token"];
  }

  if (token == null)
    return res.status(401).json({
      success: false,
      msg: "authentication failed. send the jwt with requests OR login first if not done yet.",
    });


  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    req.username = user.userId;
    if (err)
      return res
        .status(403)
        .json({ success: false, msg: "authentication failed. invalid jwt" });
    next();
  });
}
