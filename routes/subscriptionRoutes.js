const express = require("express");
const router = express.Router();
const {
  checkSubscription,
  getPackage,
} = require("../controllers/subscriptionController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/check", protect, checkSubscription);
router.get("/getPackage", getPackage);
module.exports = router;
