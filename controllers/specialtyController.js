// // server/controllers/specialtyController.js
const { default: slugify } = require("slugify");
const Specialty = require("../models/specialtyModel");
const Hospital = require("../models/hospitalModel");
const HospitalSpecialty = require("../models/hospitalSpecialtyModel");

const { Op } = require("sequelize");
const path = require("path");
const { Doctor, DoctorSpecialty, Rating } = require("../models");
const User = require("../models/userModel");

// Thêm chuyên khoa của hệ thống

const addSpecialty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const specialty = await Specialty.findOne({ where: { name } });
    if (specialty) {
      return res.status(400).json({ message: "Specialty already exists" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const photoUrl = `/uploads/${file.filename}`;
    const slug = slugify(name, { lower: true, strict: true });

    const newSpecialty = await Specialty.create({
      name,
      photo: photoUrl,
      description,
      slug,
    });
    res.json({ newSpecialty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add specialty" });
  }
};

const getListSpecialty = async (req, res) => {
  try {
    const { name } = req.query;
    let whereCondition = {};
    if (name) {
      whereCondition = {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      };
    }
    const specialties = await Specialty.findAll({ where: whereCondition });
    res.status(200).json({ specialties });
  } catch (error) {
    console.log(error.error);
    res.status(500).json({ message: "Failed to get specialty" });
  }
};

// GET LIST SPECIALTY ONLY NAME AND ID
const getListSpecialtyOnlyIdAndName = async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      attributes: ["id", "name", "photo"], // vừa thêm 16/10/2024: lấy thêm photo
    });
    res.status(200).json({ specialties });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get specialty" });
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const file = req.file;
    const specialty = await Specialty.findByPk(id);
    if (!specialty) {
      return res
        .status(404)
        .json({ message: "Vui lòng chọn chuyên khoa để thay đổi!" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    let photoUrl = specialty.photo;
    if (file) {
      photoUrl = `/uploads/${file.filename}`;
    }
    const updatedSpecialty = await specialty.update({
      name,
      photo: photoUrl,
      description,
      slug,
    });
    res.status(200).json({ updatedSpecialty });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update specialty" });
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id);
    if (!specialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    await specialty.destroy();
    res.status(200).json({ message: "Specialty deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete specialty" });
  }
};
// Lấy chuyên khoa theo id để lấy danh sách bác sĩ và bệnh viện
const getSpecialtyIdFilterList = async (req, res) => {
  const { specialtyId } = req.params;
  const { type } = req.query;

  try {
    let doctors = [];
    let hospitals = [];

    // Lấy danh sách bác sĩ theo
    if (type === "doctor" || type === "all") {
      // lấy danh sách hospitalSpecial theo specialtyId
      const hospitalSpecialties = await HospitalSpecialty.findAll({
        where: { specialty_id: specialtyId },
      });
      // lấy danh sách doctor theo hospitalSpecialtyId
      const doctorSpecialties = await DoctorSpecialty.findAll({
        where: {
          hospital_specialty_id: hospitalSpecialties.map((item) => item.id),
        },
      });
      // danh sách specialty theo doctorSpecialtyId

      // lấy danh sách doctor theo doctorSpecialtyId
      const rawDoctors = await Doctor.findAll({
        where: { id: doctorSpecialties.map((item) => item.doctor_id) },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Rating,
            as: "ratings",
          },
          {
            model: DoctorSpecialty,
            as: "doctorSpecialty",
            // where: {
            //   hospital_specialty_id: hospitalSpecialties.map((item) => item.id),
            // },
            include: [
              {
                model: HospitalSpecialty,
                as: "hospitalSpecialty",
                include: [
                  {
                    model: Specialty,
                    as: "specialty",
                  },
                ],
              },
            ],
          },
        ],
      });
      // lấy danh sách doctor theo doctorSpecialtyId nhưng trùng thì chỉ lấy 1
      doctors = rawDoctors.map((doctor) => {
        const uniqueSpecialties = [];
        const specialtyIds = new Set();

        doctor.doctorSpecialty.forEach((specialty) => {
          if (!specialtyIds.has(specialty.hospitalSpecialty.specialty_id)) {
            uniqueSpecialties.push(specialty);
            specialtyIds.add(specialty.hospitalSpecialty.specialty_id);
          }
        });
        const ratings = doctor.ratings;
        const totalComments = ratings.length;
        const averageRating =
          totalComments > 0
            ? ratings.reduce((acc, rating) => acc + rating.rating, 0) /
              totalComments
            : 0;

        return {
          ...doctor.toJSON(),
          doctorSpecialty: uniqueSpecialties,
          averageRating: averageRating.toFixed(1),
          totalComments: totalComments,
        };
      });
    }

    // Lấy danh sách bệnh viện
    if (type === "hospital" || type === "all") {
      hospitals = await Hospital.findAll({
        include: [
          {
            model: HospitalSpecialty,
            as: "hospitalSpecialty",
            where: { specialty_id: specialtyId }, // Lọc theo chuyên khoa
            include: [
              {
                model: Specialty,
                as: "specialty",
              },
            ],
          },
        ],
      });
    }

    return res.json({ doctors, hospitals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// lấy dịch vụ chuyên khoa theo hospitalId
const getSpecialtyByHospitalId = async (req, res) => {
  const { hospitalId } = req.query;
  try {
    const specialties = await HospitalSpecialty.findAll({
      where: { hospital_id: hospitalId },
      include: [
        {
          model: Specialty,
          as: "specialty",
        },
      ],
    });
    return res.json({ specialties });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// lấy chi tiết chuyên khoa theo hospitalId và specialtyId
const getSpecialtyDetailOfHospital = async (req, res) => {
  const { hospitalId, specialtyId } = req.query;
  try {
    const specialty = await HospitalSpecialty.findOne({
      where: { hospital_id: hospitalId, specialty_id: specialtyId },
      include: [
        {
          model: Specialty,
          as: "specialty",
        },
      ],
    });
    return res.json({ specialty });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  addSpecialty,
  getListSpecialty,
  updateSpecialty,
  deleteSpecialty,
  getListSpecialtyOnlyIdAndName,
  getSpecialtyIdFilterList,
  getSpecialtyByHospitalId,
  getSpecialtyDetailOfHospital,
};
