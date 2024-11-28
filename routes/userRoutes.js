const express = require("express");
const router = express.Router();
const {
  createAccount,
  activateAccount,
  createProfile,
  getAllProfileOfUser,
} = require("../controllers/userController.js");
const { protect, restrictTo } = require("../middlewares/authMiddleware.js");

router.post("/create-account", protect, restrictTo("admin"), createAccount);
router.put("/create-profile/:id", createProfile);
router.get("/get-profile", protect, getAllProfileOfUser);
module.exports = router;
