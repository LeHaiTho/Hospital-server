const express = require("express");
const {
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/send-notification", sendNotification);
router.get("/get-notifications", protect, getNotifications);
router.patch("/mark-as-read/:id/read", protect, markNotificationAsRead);
router.patch("/mark-all-as-read", protect, markAllNotificationAsRead);

module.exports = router;
