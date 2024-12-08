const express = require("express");
const {
  createWorkingDayForHospital,
  getHospitalWorkingDaysTimeSlots,
  getHospitalScheduleForCalendar,
} = require("../controllers/workingDayController");
const { protect, resizeTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/create-working-day-for-hospital",
  protect,
  createWorkingDayForHospital
);
router.get(
  "/get-hospital-working-days-time-slots",
  protect,
  getHospitalWorkingDaysTimeSlots
);
router.get(
  "/get-hospital-schedule-for-calendar",
  protect,
  getHospitalScheduleForCalendar
);

module.exports = router;
