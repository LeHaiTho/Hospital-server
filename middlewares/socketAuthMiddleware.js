const jwt = require("jsonwebtoken");

const socketAuth = (secretKey) => {
  return (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token không tồn tại"));
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error("Token không hợp lệ"));
    }
  };
};

module.exports = socketAuth;
