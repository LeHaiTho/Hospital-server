const { where } = require("sequelize");
const { ChatRoom, Message } = require("../../../models");

module.exports = (io, socket) => {
  socket.on("send-message", async (data) => {
    // console.log("send-message", data);
    const { roomId, message } = data;
    console.log("roomId", roomId);
    console.log("message", message);
    const room = await ChatRoom.findOne({ where: { room_id: roomId } });
    console.log("room", room.id);
    const newMessage = await Message.create({
      room_id: room.id,
      sender_id: socket.user.id,
      content: message,
    });
    // console.log("newMessage", newMessage.dataValues);
    io.to(roomId).emit("receive-message", newMessage);
  });
};
