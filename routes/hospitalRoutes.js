const express = require("express");
const {
  createHospital,
  getListHospital,
  getHospitalById,
  updateHospital,
  getHospital_shiftTyes,
  getHospitalNearBy,
  getHospitalDetail,
  getHospitalConditions,
} = require("../controllers/hospitalController");
const upload = require("../middlewares/uploadMiddleware");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const router = express.Router();

// router.use(protect);
// router.use(restrictTo(["admin"]));

router.get("/near-by", getHospitalNearBy);
router.get("/shift", protect, getHospital_shiftTyes);
router.post("/create-new", createHospital);
router.get("/get-list", getListHospital);
router.get("/filter", getHospitalConditions);
router.get("/:id?", protect, getHospitalById);
router.put(
  "/update/:id?",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateHospital
);
router.get("/detail/:id", getHospitalDetail);
module.exports = router;
