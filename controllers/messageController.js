const sequelize = require("../config/database");
const { Message, ChatRoom } = require("../models");

const getMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.findAll({
      where: { room_id: roomId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getMessages };
