const express = require("express");
const { createRole, deleteRole } = require("../controllers/roleController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// router.use(protect);
// router.use(restrictTo(["admin"]));

router.post("/roles/create-new", createRole);
router.delete("/roles/:id", deleteRole);

module.exports = router;
