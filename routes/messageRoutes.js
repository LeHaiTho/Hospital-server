const express = require("express");
const { getMessages } = require("../controllers/messageController");
const router = express.Router();

router.get("/:roomId", getMessages);

module.exports = router;
