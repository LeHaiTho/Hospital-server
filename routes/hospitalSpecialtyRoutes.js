const express = require("express");
const {
  addHospitalSpecialty,
  getListHospitalSpecialties,
  getListSpecialtyOfHospital,
  addSpecialtyToHospital,
  getHospitalBySpecialtyAndDoctorId,
} = require("../controllers/hospitalSpecialtyController");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/create-new",
  protect,
  upload.single("image"),
  addHospitalSpecialty
);
router.get("/list", protect, getListHospitalSpecialties);
router.get("/list-specialty-of-hospital", protect, getListSpecialtyOfHospital);
router.post("/add-specialty-to-hospital", protect, addSpecialtyToHospital);
router.get(
  "/:specialtyId/:doctorId/get-hospital-by-specialty-and-doctor-id",
  getHospitalBySpecialtyAndDoctorId
);
module.exports = router;
