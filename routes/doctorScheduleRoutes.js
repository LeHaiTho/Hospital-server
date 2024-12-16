const express = require("express");
const {
  createDoctorSchedule,
  getAppointmentSlotsByDoctorAndDate,
  getDoctorScheduleDates,
  getDoctorSchedule,
  getDoctorScheduleAfterCurrentDate,
  getDoctorWorkplace,
  getDoctorScheduleBySpecialtyAndHospital,
  createDoctorSchedule2,
  getAllDoctorSchedule,
} = require("../controllers/doctorScheduleController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-schedule", protect, createDoctorSchedule);
router.get("/doctor/:doctorId/get-slots", getAppointmentSlotsByDoctorAndDate);
router.get("/doctor/:doctorId/get-dates", getDoctorScheduleDates);
router.get("/doctor/get-schedule", protect, getDoctorSchedule);
router.get(
  "/doctor/get-schedule-after-current-date",
  protect,
  getDoctorScheduleAfterCurrentDate
);
router.get("/doctor/get-workplace", protect, getDoctorWorkplace);
router.get(
  "/doctor/get-schedule-by-specialty-and-hospital",
  getDoctorScheduleBySpecialtyAndHospital
);
router.get("/get-all-schedule", protect, getAllDoctorSchedule);
router.post("/create-schedule2", protect, createDoctorSchedule2);
module.exports = router;
