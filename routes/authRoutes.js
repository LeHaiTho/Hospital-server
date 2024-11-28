const express = require("express");
const {
  login,
  changePasswordFirstLogin,
  getUserInfoWithToken,
  registerPatient,
  registerStaff,
} = require("../controllers/authController");
const {
  protect,
  isFirstLogin,
  restrictTo,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post(
  "/change-password-first-login",
  isFirstLogin,
  changePasswordFirstLogin
);
router.post("/register-patient", registerPatient);
router.get("/user-info", protect, getUserInfoWithToken);
router.post("/register-staff", protect, restrictTo("manager"), registerStaff);
module.exports = router;
