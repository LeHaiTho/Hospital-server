const express = require("express");
const {
  createChatRoom,
  getChatRooms,
} = require("../controllers/chatRoomController");
const router = express.Router();

router.get("/:doctor_id", getChatRooms);
router.post("/create", createChatRoom);

module.exports = router;
