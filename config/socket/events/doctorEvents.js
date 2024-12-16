const doctorsOnline = new Map();

module.exports = (io, socket) => {
  //   nếu người dùng là bác sĩ
  if (socket.user.role === "doctor") {
    doctorsOnline.set(socket.user.id, socket.id);
    // console.log("doctorsOnline", doctorsOnline);
  }
  // lắng nghe khi bác sĩ ngắt kết nối
  socket.on("disconnect", () => {
    doctorsOnline.delete(socket.user.id);
    // console.log("doctorsOnline", doctorsOnline);
  });

  // lắng nghe khi người dùng xem danh sách bác sĩ online
  socket.on("get-doctors", (callback) => {
    const doctorOnline = Array.from(doctorsOnline.keys());
    callback(doctorOnline);
  });
};
