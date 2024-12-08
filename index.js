require("dotenv").config();
const sequelize = require("./config/database");
const syncDatabase = require("./config/syncDatabase");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cron = require("node-cron");

// Routes
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const specialtyRoutes = require("./routes/specialtyRoutes");
const uploadController = require("./controllers/uploadController");
const router = require("./routes/userRoutes");
const hospitalSpecialtyRoutes = require("./routes/hospitalSpecialtyRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const doctorScheduleRoutes = require("./routes/doctorScheduleRoutes");
const workingDayRoutes = require("./routes/workingDayRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pushTokenRoutes = require("./routes/pushTokenRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const doctorUnavailableTimeRoutes = require("./routes/doctorUnavailableTimeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const questionRoutes = require("./routes/questionRoutes");
const roomRoutes = require("./routes/roomRoutes");
const { startCron } = require("./cron");
const app = express();

// const admin = require("./config/firebaseConfig"); // Import firebaseService

// Middleware
// app.use;
// helmet({
//   crossOriginResourcePolicy: false,
// })();
app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Sử dụng cho dữ liệu URL-encoded

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/admin", roleRoutes);
app.use("/auth", authRoutes);
app.use("/hospitals", hospitalRoutes);
app.use("/users", userRoutes);
app.use("/specialties", specialtyRoutes);
app.use("/hospital-specialties", hospitalSpecialtyRoutes);
app.use("/doctors", doctorRoutes);
app.use("/doctor-schedules", doctorScheduleRoutes);
app.use("/working-days", workingDayRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/doctor-unavailable-times", doctorUnavailableTimeRoutes);
app.use("/notifications", notificationRoutes);
app.use("/push-tokens", pushTokenRoutes);
app.use("/ratings", ratingRoutes);
app.use("/payments", paymentRoutes);
app.use("/medical-histories", medicalHistoryRoutes);
app.use("/questions", questionRoutes);
app.use("/rooms", roomRoutes);

// Start the server
// syncDatabase()
//   .then(() => {
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`Server listening on ${PORT}`);
//       // startCron();
//       // console.log("name:", process.env.ADMIN_PASSWORD);
//     });
//   })
//   .catch((error) => {
//     console.log("Error:", error);
//   });

const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

let users = {};
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // startCron();
  console.log(`Server listening on ${PORT}`);
});
