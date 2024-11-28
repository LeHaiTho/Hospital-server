const express = require("express");
const { createRating, getRatings } = require("../controllers/ratingController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", protect, createRating);
router.get("/get-ratings/:doctor_id", getRatings);

module.exports = router;
