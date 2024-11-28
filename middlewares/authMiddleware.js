const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối!" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ!" });
    }
  } else {
    next();
  }
};

const restrictTo = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(401).json({ message: "Bạn không có quyền truy cập!" });
    }
    next();
  };
};

const isFirstLogin = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.isFirstLogin) {
      req.user = decoded;
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn!" });
  }
};

module.exports = { protect, restrictTo, isFirstLogin };
