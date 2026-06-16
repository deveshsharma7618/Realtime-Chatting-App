import config from "../config/env.js";

const adminMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    if(token == config.adminToken){
        req.user = { role: "admin" };
    } else {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Invalid admin token",
        });
    }

    next();


  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};


export { adminMiddleware };