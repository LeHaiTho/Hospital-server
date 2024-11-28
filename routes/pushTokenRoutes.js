const express = require("express");
const {
  createPushToken,
  deletePushToken,
} = require("../controllers/pushTokenController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", protect, createPushToken);
router.post("/delete", protect, deletePushToken);
module.exports = router;
