module.exports = (io, socket) => {
  // nhận tin nhắn từ client
  socket.on("sendMessage", (data) => {
    console.log("sendMessage", data);

    //   // phản hồi tin nhắn lại cho client
    //   socket.emit("receiveMessage", data);
    //   socket.to(data.receiverId).emit("receiveMessage", data);
    // });
    socket.on("send-message", (data) => {
      console.log("send-message", data);
    });
    // xử lý khi người dùng ngắt kết nối
    socket.on("disconnect", () => {
      console.log("a user disconnected", socket.user.id);
    });
  });
};
