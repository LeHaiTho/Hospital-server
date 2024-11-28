const express = require("express");
const router = express.Router();
const {
  receiveMedicalHistory,
  getMedicalHistoryDetail,
  getPrescriptionDetail,
} = require("../controllers/medicalHistoryController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
router.post(
  "/receive-medical-history",
  upload.array("diagnostic_files"),
  receiveMedicalHistory
);
router.get("/get-medical-history-detail/:id", protect, getMedicalHistoryDetail);
router.get("/get-prescription-detail/:id", protect, getPrescriptionDetail);

module.exports = router;
