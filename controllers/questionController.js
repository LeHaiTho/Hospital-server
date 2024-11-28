const Question = require("../models/questionModel");
const User = require("../models/userModel");
const Specialty = require("../models/specialtyModel");
const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const Role = require("../models/roleModel");
const Doctor = require("../models/doctorModel");

const { Sequelize } = require("sequelize");
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      order: [["createdAt", "DESC"]], // Sắp xếp câu hỏi theo ngày tạo tăng dần
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Specialty,
          as: "specialty",
        },
        {
          model: Like,
          as: "likes",
        },
        {
          model: Comment,
          as: "comments",

          // SẮP xếp theo ngày tạo tăng dần

          include: [
            {
              model: User,
              as: "user",
              include: [
                {
                  model: Role,
                  as: "role",
                },
              ],
            },
          ],
        },
      ],
    });
    questions.forEach((question) => {
      question.comments.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// thêm câu hỏi
const addQuestion = async (req, res) => {
  const { content, specialtyId, isAnonymous } = req.body;
  const image = req.file;
  try {
    const imageUrl = image ? `/uploads/${image.filename}` : null;
    const question = await Question.create({
      content,
      specialty_id: specialtyId,
      is_anonymous: isAnonymous,
      user_id: req.user.id,
      image: imageUrl,
    });
    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// trả lời câu hỏi
const answerQuestion = async (req, res) => {
  const { question_id, content } = req.body;
  try {
    const answer = await Comment.create({
      content,
      question_id,
      user_id: req.user.id,
    });
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllQuestions,
  addQuestion,
  answerQuestion,
};
