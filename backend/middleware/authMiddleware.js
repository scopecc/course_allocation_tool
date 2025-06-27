import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    console.log("Unauthorized: No Token Provided.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed: ', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired. ' });
      }
      return res.status(403).json({ message: "Forbidden: Invalid Token" });
    }
    req.userId = decoded;
    next();
  });
}
