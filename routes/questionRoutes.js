const express = require("express");
const {
  getAllQuestions,
  addQuestion,
  answerQuestion,
} = require("../controllers/questionController");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getAllQuestions);
router.post("/add", protect, upload.single("image"), addQuestion);
router.post("/answer", protect, answerQuestion);
module.exports = router;
