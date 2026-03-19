const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // 4. Attach decoded data to request
    req.user = decoded;
    next();
   
  });
};

module.exports = verifyToken;
