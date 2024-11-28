const sequelize = require("../config/database");
const Rating = require("../models/ratingModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

const createRating = async (req, res) => {
  const { appointment_id, rating, comment } = req.body;
  try {
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment || appointment.status !== "completed") {
      return res.status(400).json({ message: "Appointment not found" });
    }

    const newRating = await Rating.create({
      hospital_id: appointment.hospital_id,
      doctor_id: appointment.doctor_id,
      patient_id: req.user.id,
      appointment_id,
      rating,
      comment,
    });
    res.status(200).json({ newRating });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getRatings = async (req, res) => {
  const { doctor_id } = req.params;
  try {
    const reviews = await Rating.findAll({
      where: {
        doctor_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "avatar"],
        },
      ],
    });
    // const reviewData = reviews.map((review) => ({
    //   ...review.get(),
    //   user: review.user,
    // }));
    res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createRating,
  getRatings,
};
