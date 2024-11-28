const express = require("express");
const {
  createWorkingDayForHospital,
  getHospitalWorkingDaysTimeSlots,
} = require("../controllers/workingDayController");
const { protect } = require("../middlewares/authMiddleware");

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

module.exports = router;