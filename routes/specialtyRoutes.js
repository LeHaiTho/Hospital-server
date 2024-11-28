// server/routes/specialtyRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  addSpecialty,
  getListSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getListSpecialtyOnlyIdAndName,
  getListSpecialtyOnlyNameAndPhoto,
  getSpecialtyIdFilterList,
  getSpecialtyByHospitalId,
  getSpecialtyDetailOfHospital,
} = require("../controllers/specialtyController");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

// router.use(protect);
// router.use(restrictTo("admin"));

// Đang làm sửa sau lỗi thì bật lên
// router.post("/create-new", upload.single("photo"), addSpecialty);

router.post("/add-specialty-to-hospital", protect, addSpecialty);
router.get("/list-by-hospital", getSpecialtyByHospitalId);
router.get("/list", getListSpecialty);
router.put("/update/:id", upload.single("photo"), updateSpecialty);
router.delete("/delete/:id", deleteSpecialty);
router.get("/list-to-select", getListSpecialtyOnlyIdAndName);
router.get("/:specialtyId/entities", getSpecialtyIdFilterList);
router.get("/detail", getSpecialtyDetailOfHospital);
module.exports = router;
