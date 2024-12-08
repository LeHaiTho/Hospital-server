const { where } = require("sequelize");
const {
  Hospital,
  DoctorSpecialty,
  DoctorHospital,
  Doctor,
} = require("../models");
const HospitalSpecialty = require("../models/hospitalSpecialtyModel");
const Specialty = require("../models/specialtyModel");
const { Op } = require("sequelize");

const addHospitalSpecialty = async (req, res) => {
  const { hospital_id, specialty, name, description, consultation_fee } =
    req.body;
  const file = req.file;
  const imageUrl = `/uploads/${file.filename}`;
  try {
    const { id } = req.user;
    if (req.user) {
      const hospital = await Hospital.findOne({
        where: {
          manager_id: id,
        },
      });

      let existingSpecialty = await HospitalSpecialty.findOne({
        where: {
          hospital_id: hospital.id,
          specialty_id: specialty,
        },
      });
      if (existingSpecialty) {
        // Nếu đã tồn tại, cập nhật thông tin mới
        await existingSpecialty.update({
          name,
          description,
          consultation_fee,
          image: imageUrl || existingSpecialty.image, // Giữ ảnh cũ nếu không tải ảnh mới
        });
        res.status(200).json({ message: "Cập nhật dịch vụ thành công!" });
      }

      // await HospitalSpecialty.create({
      //   hospital_id: hospital.id,
      //   specialty_id: specialty,
      //   name,
      //   description,
      //   consultation_fee,
      //   image: imageUrl,
      // });
      // res.status(200).json({ message: "Thêm chuyên khoa thành công!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add hospital specialty" });
  }
};

// thêm chuyên khoa vào bệnh viện
const addSpecialtyToHospital = async (req, res) => {
  const { specialtyIds } = req.body;
  const managerId = req.user.id;
  try {
    const hospital = await Hospital.findOne({
      where: {
        manager_id: managerId,
      },
    });
    for (const specialtyId of specialtyIds) {
      const specialty = await Specialty.findByPk(specialtyId);
      if (specialty) {
        await HospitalSpecialty.findOrCreate({
          where: {
            hospital_id: hospital.id,
            specialty_id: specialty.id,
          },
        });
      }
    }
    res.status(200).json({ message: "Thêm chuyên khoa thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add specialty to hospital" });
  }
};

const getListHospitalSpecialties = async (req, res) => {
  try {
    if (req.user) {
      const hospital = await Hospital.findOne({
        where: {
          manager_id: req.user.id,
        },
      });
      const specialties = await HospitalSpecialty.findAll({
        where: {
          hospital_id: hospital.id,
          name: { [Op.not]: null }, // Điều kiện name khác null
          description: { [Op.not]: null }, // Điều kiện description khác null
        },
      });
      res.status(200).json({ specialties });
    }
  } catch (error) {
    console.log(error);
  }
};

// danh sách chuyên khoa của bệnh viện với tên chuyên khoa của hệ thống
const getListSpecialtyOfHospital = async (req, res) => {
  try {
    const managerId = req.user.id;
    const hospital = await Hospital.findOne({
      where: {
        manager_id: managerId,
      },
    });
    // lấy các id chuyên khoa của bệnh viện
    const specialtiesOfHospital = await HospitalSpecialty.findAll({
      where: {
        hospital_id: hospital.id,
      },
      attributes: ["specialty_id"],
    });
    // gọp thành 1 mảng
    const arraySpecialtyId = specialtiesOfHospital.map(
      (item) => item.specialty_id
    );
    // lấy tên chuyên khoa của hệ thống
    const specialtiesOfSystem = await Specialty.findAll({
      where: {
        id: arraySpecialtyId,
      },
      attributes: ["id", "name"],
    });
    res.status(200).json({ specialtiesOfSystem });
  } catch (error) {
    console.log(error);
  }
};

// lấy bệnh viện theo chuyên khoa và id bác sĩ
// const getHospitalBySpecialtyAndDoctorId = async (req, res) => {
//   const { specialtyId, doctorId } = req.params;

//   try {
//     // Find hospitals associated with the given specialty and doctor
//     // const hospitals = await Hospital.findAll({
//     //   include: [
//     //     {
//     //       model: HospitalSpecialty,
//     //       as: "hospitalSpecialty",
//     //       where: {
//     //         specialty_id: specialtyId,
//     //       },
//     //     },
//     //     {
//     //       model: DoctorHospital,
//     //       as: "doctorHospital",
//     //       where: {
//     //         doctor_id: doctorId,
//     //       },
//     //     },
//     //   ],
//     // });
//     const doctorHospitals = await DoctorHospital.findAll({
//       where: {
//         doctor_id: doctorId,
//       },
//     });
//     // lấy bệnh viện từ doctorHospital tại specialtyId=specialtyId
//     const hospitals = await HospitalSpecialty.findAll({
//       where: {
//         hospital_id: doctorHospitals.map((item) => item.hospital_id),
//         specialty_id: specialtyId,
//       },
//     });
//     res.json(hospitals);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while retrieving hospitals" });
//   }
// };

const getHospitalBySpecialtyAndDoctorId = async (req, res) => {
  const { specialtyId, doctorId } = req.params;

  try {
    // Tìm các bệnh viện thỏa mãn điều kiện
    const hospitals = await HospitalSpecialty.findAll({
      where: {
        specialty_id: specialtyId,
      },
    });
    // lấy bệnh viện từ doctorHospital tại specialtyId=specialtyId
    const hospitalSpecialties = await HospitalSpecialty.findAll({
      where: {
        hospital_id: hospitals.map((item) => item.hospital_id),
        specialty_id: specialtyId,
      },
      include: [
        {
          model: Hospital,
          as: "hospital",
        },
      ],
    });
    const doctorSpecialties = await DoctorSpecialty.findAll({
      where: {
        doctor_id: doctorId,
        hospital_specialty_id: hospitalSpecialties.map((item) => item.id),
      },
      include: [
        {
          model: HospitalSpecialty,
          as: "hospitalSpecialty",
          include: [
            {
              model: Hospital,
              as: "hospital",
            },
          ],
        },
      ],
    });

    res.status(200).json(doctorSpecialties);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving hospitals" });
  }
};
module.exports = {
  addHospitalSpecialty,
  getListHospitalSpecialties,
  getListSpecialtyOfHospital,
  addSpecialtyToHospital,
  getHospitalBySpecialtyAndDoctorId,
};
