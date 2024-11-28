const express = require("express");
const router = express.Router();
const {
  createDoctorUnavailableTime,
  appointmentByDoctorUnavailableTime,
  getDoctorUnavailableTimeList,
  getDoctorUnavailableTimeListByHospital,
  updateDoctorUnavailableTimeStatus,
} = require("../controllers/doctorUnavailableTimeController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/create", protect, createDoctorUnavailableTime);
router.post("/get-appointment", appointmentByDoctorUnavailableTime);
router.get("/get-list", protect, getDoctorUnavailableTimeList);
router.get(
  "/get-list-by-hospital",
  protect,
  getDoctorUnavailableTimeListByHospital
);
router.patch("/update-status/:id", protect, updateDoctorUnavailableTimeStatus);
module.exports = router;
