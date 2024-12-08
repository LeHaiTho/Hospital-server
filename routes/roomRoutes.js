const express = require("express");
const router = express.Router();
const { createRoom, getListRoom } = require("../controllers/roomController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.post("/create-room", protect, restrictTo("manager"), createRoom);
router.get("/list-room", protect, restrictTo("manager"), getListRoom);
module.exports = router;
