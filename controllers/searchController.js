const Hospital = require("../models/hospitalModel");
const Doctor = require("../models/doctorModel");
const Specialty = require("../models/specialtyModel");
const { Op } = require("sequelize");
const { HospitalSpecialty } = require("../models");

// search for hospitals / doctors / specialty by name
const searchByName = async (req, res) => {
  try {
    const { text } = req.query;
    const hospitals = await Hospital.findAll({
      where: {
        name: {
          [Op.iLike]: `%${text}%`,
        },
      },
      attributes: ["id", "name", "address", "banner"],
    });

    const specialties = await Specialty.findAll({
      where: {
        name: {
          [Op.iLike]: `%${text}%`,
        },
      },
      attributes: ["id", "name", "photo"],
    });
    // Lấy tên dịch vụ liên quan đến từ khóa
    const hospitalSpecialties = await HospitalSpecialty.findAll({
      include: [
        {
          model: Specialty,
          as: "specialty",
          where: {
            name: {
              [Op.iLike]: `%${text}%`,
            },
          },
        },
      ],
    });
    res.status(200).json({ hospitals, specialties, hospitalSpecialties });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to search" });
  }
};
module.exports = { searchByName };
