module.exports = (io, socket) => {
  socket.on("join-room", (data) => {
    console.log("join-room", data);
    socket.join(data.roomId);
    console.log("socket.rooms", socket.rooms);
  });
};
