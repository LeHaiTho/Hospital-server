const sequelize = require("../config/database");
const { DoctorSpecialty, DoctorHospital } = require("../models");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { HospitalSpecialty, Hospital, Specialty, Rating } = require("../models");

const createDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      licenseCode,
      fullname,
      email,
      phone,
      description,
      specialty,
      gender,
      birthday,
      consultation_fee,
    } = req.body;
    const file = req.file || null;
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // Kiểm tra xem bác sĩ đã tồn tại chưa
    let doctor = await Doctor.findOne({
      where: { certificate_id: licenseCode },
    });

    // Bệnh viện hiện tại
    const hospital = await Hospital.findOne({
      where: {
        manager_id: req.user.id,
      },
    });

    // Nếu bác sĩ chưa tồn tại, tạo tài khoản và thông tin bác sĩ mới
    if (!doctor) {
      const hashedPassword = await bcrypt.hash(email, 10);
      const newAccount = await User.create(
        {
          username: email,
          fullname,
          email,
          phone,
          password: hashedPassword,
          role_id: 3, // Giả sử 3 là role bác sĩ
          isActive: true,
          avatar: imageUrl,
          gender,
          date_of_birth: birthday,
          isFirstLogin: true,
        },
        { transaction: t }
      );

      doctor = await Doctor.create(
        {
          description,
          user_id: newAccount.id,
          certificate_id: licenseCode,
        },
        { transaction: t }
      );
    }

    // Kiểm tra và thêm quan hệ bác sĩ - bệnh viện
    const existingDoctorHospital = await DoctorHospital.findOne({
      where: { doctor_id: doctor.id, hospital_id: hospital.id },
      transaction: t,
    });

    if (!existingDoctorHospital) {
      await DoctorHospital.create(
        {
          doctor_id: doctor.id,
          hospital_id: hospital.id,
        },
        { transaction: t }
      );
    }

    // Thêm các chuyên khoa cho bác sĩ
    const specialtyIds = specialty.split(",").map((id) => parseInt(id));
    const hospitalSpecialties = await HospitalSpecialty.findAll({
      where: { specialty_id: specialtyIds, hospital_id: hospital.id },

      transaction: t,
    });

    for (const hospitalSpecialty of hospitalSpecialties) {
      const existingDoctorSpecialty = await DoctorSpecialty.findOne({
        where: {
          doctor_id: doctor.id,
          hospital_specialty_id: hospitalSpecialty.id,
        },

        transaction: t,
      });

      if (!existingDoctorSpecialty) {
        await DoctorSpecialty.create(
          {
            doctor_id: doctor.id,
            hospital_specialty_id: hospitalSpecialty.id,
            consultation_fee,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res.status(200).json({ doctor });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// danh sách tất cả bác sĩ
// const getAllDoctor = async (req, res) => {
//   const doctors = await Doctor.findAll({
//     include: [
//       {
//         model: User,
//         as: "user",
//       },
//       {
//         model: DoctorSpecialty,
//         as: "doctorSpecialty",
//         include: [
//           {
//             model: HospitalSpecialty,
//             as: "hospitalSpecialty",
//             include: [
//               {
//                 model: Specialty,
//                 as: "specialty",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         model: Rating,
//         as: "ratings",
//         attributes: ["id", "rating", "comment", "createdAt"],
//         order: [["createdAt", "DESC"]],
//       },
//     ],
//   });

//   // lấy danh bác sĩ và các chuyên khoa của họ
//   const doctorList = doctors.map((doctor) => {
//     const ratings = doctor.ratings;
//     const totalComments = ratings.length;
//     const averageRating =
//       totalComments > 0
//         ? ratings.reduce((acc, rating) => acc + rating.rating, 0) /
//           totalComments
//         : 0;
//     return {
//       id: doctor.id,
//       fullname: doctor.user.fullname,
//       email: doctor.user.email,
//       avatar: doctor.user.avatar,
//       description: doctor.description,
//       consultation_fee: doctor.doctorSpecialty.map(
//         (specialty) => specialty.consultation_fee
//       ),
//       specialties: Array.from(
//         new Map(
//           doctor.doctorSpecialty.map((specialty) => [
//             specialty.hospitalSpecialty.specialty_id,
//             {
//               id: specialty.hospitalSpecialty.specialty_id,
//               name: specialty.hospitalSpecialty.specialty.name,
//             },
//           ])
//         ).values()
//       ),
//       averageRating: averageRating.toFixed(1),
//       totalComments,
//     };
//   });
//   res.status(200).json({ doctorList });
// };
const getAllDoctor = async (req, res) => {
  const { hospital_id } = req.query; // Lấy query param `hospital_id`

  try {
    // Điều kiện lọc dựa trên `hospital_id`
    const whereCondition = hospital_id
      ? { "$doctorSpecialty.hospitalSpecialty.hospital_id$": hospital_id }
      : {};

    const doctors = await Doctor.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: DoctorSpecialty,
          as: "doctorSpecialty",
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
        {
          model: Rating,
          as: "ratings",
          attributes: ["id", "rating", "comment", "createdAt"],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    // Xử lý danh sách bác sĩ và các thông tin liên quan
    const doctorList = doctors.map((doctor) => {
      const ratings = doctor.ratings;
      const totalComments = ratings.length;
      const averageRating =
        totalComments > 0
          ? ratings.reduce((acc, rating) => acc + rating.rating, 0) /
            totalComments
          : 0;
      return {
        id: doctor.id,
        fullname: doctor.user.fullname,
        email: doctor.user.email,
        avatar: doctor.user.avatar,
        description: doctor.description,
        consultation_fee: doctor.doctorSpecialty.map(
          (specialty) => specialty.consultation_fee
        ),
        specialties: Array.from(
          new Map(
            doctor.doctorSpecialty.map((specialty) => [
              specialty.hospitalSpecialty.specialty_id,
              {
                id: specialty.hospitalSpecialty.specialty_id,
                name: specialty.hospitalSpecialty.specialty.name,
              },
            ])
          ).values()
        ),
        averageRating: averageRating.toFixed(1),
        totalComments,
      };
    });

    // Trả về kết quả
    res.status(200).json({ doctorList });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// lọc bác sĩ
const filterDoctor = async (req, res) => {
  const { hospital_id } = req.query; // Lấy query param `hospital_id`

  try {
    // Điều kiện lọc dựa trên `hospital_id`
    const whereCondition = hospital_id
      ? { "$doctorSpecialty.hospitalSpecialty.hospital_id$": hospital_id }
      : {};

    const doctors = await Doctor.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: DoctorSpecialty,
          as: "doctorSpecialty",
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
        {
          model: Rating,
          as: "ratings",
          attributes: ["id", "rating", "comment", "createdAt"],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    // Xử lý danh sách bác sĩ và các thông tin liên quan
    const doctorList = doctors.map((doctor) => {
      const ratings = doctor.ratings;
      const totalComments = ratings.length;
      const averageRating =
        totalComments > 0
          ? ratings.reduce((acc, rating) => acc + rating.rating, 0) /
            totalComments
          : 0;
      return {
        id: doctor.id,
        fullname: doctor.user.fullname,
        email: doctor.user.email,
        avatar: doctor.user.avatar,
        description: doctor.description,
        consultation_fee: doctor.doctorSpecialty.map(
          (specialty) => specialty.consultation_fee
        ),
        specialties: Array.from(
          new Map(
            doctor.doctorSpecialty.map((specialty) => [
              specialty.hospitalSpecialty.specialty_id,
              {
                id: specialty.hospitalSpecialty.specialty_id,
                name: specialty.hospitalSpecialty.specialty.name,
              },
            ])
          ).values()
        ),
        averageRating: averageRating.toFixed(1),
        totalComments,
      };
    });

    // Trả về kết quả
    res.status(200).json({ doctorList });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// danh sách bác sĩ thuộc bệnh viện
const getDoctorOfHospital = async (req, res) => {
  const hospital = await Hospital.findOne({
    where: {
      manager_id: req.user.id,
    },
  });

  const doctorHospital = await DoctorHospital.findAll({
    where: {
      hospital_id: hospital.id,
    },
    include: [
      {
        model: Doctor,
        as: "doctor",
        attributes: ["id", "description", "user_id", "certificate_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "fullname",
              "email",
              "phone",
              "avatar",
              "gender",
              "date_of_birth",
            ],
          },
          {
            model: DoctorHospital,
            as: "doctorHospital",
            where: {
              hospital_id: hospital.id,
            },
          },
          {
            model: DoctorSpecialty,
            as: "doctorSpecialty",
            attributes: ["id", "hospital_specialty_id", "consultation_fee"],
            include: [
              {
                model: HospitalSpecialty,
                as: "hospitalSpecialty",
                attributes: ["specialty_id"],
                where: {
                  hospital_id: hospital.id,
                },
                include: [
                  {
                    model: Specialty,
                    as: "specialty",
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  const doctorList = doctorHospital.map((item) => ({
    id: item.doctor.id,
    avatar: item.doctor.user.avatar,
    fullname: item.doctor.user.fullname,
    email: item.doctor.user.email,
    phone: item.doctor.user.phone,
    description: item.doctor.description,
    gender: item.doctor.user.gender,
    birthday: item.doctor.user.date_of_birth,
    licenseCode: item.doctor.certificate_id,
    consultation_fee: item.doctor.doctorSpecialty.map(
      (specialty) => specialty.consultation_fee
    ),
    // specialties: item.doctor.doctorSpecialty.map((specialty) => ({
    //   id: specialty.hospitalSpecialty.specialty_id,
    //   name: specialty.hospitalSpecialty.specialty.name,
    // })),
    // lọc chuyên khoa duy nhất
    specialties: Array.from(
      new Map(
        item.doctor.doctorSpecialty.map((specialty) => [
          specialty.hospitalSpecialty.specialty_id,
          {
            id: specialty.hospitalSpecialty.specialty_id,
            name: specialty.hospitalSpecialty.specialty.name,
          },
        ])
      ).values()
    ),
    isActive: item.doctor.doctorHospital[0].is_active,
  }));
  res.status(200).json({ doctorList });
};

// lấy danh sách tên bác sĩ
const getDoctorNameList = async (req, res) => {
  const manager_id = req.user.id;
  const hospital = await Hospital.findOne({
    where: {
      manager_id,
    },
  });
  const doctorHospital = await DoctorHospital.findAll({
    where: {
      hospital_id: hospital.id,
    },
    include: [
      {
        model: Doctor,
        as: "doctor",
        attributes: ["id", "user_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "fullname"],
          },
        ],
      },
    ],
  });
  const doctorList = doctorHospital.map((item) => ({
    id: item.doctor.id,
    fullname: item.doctor.user.fullname,
  }));
  res.status(200).json({ doctorList });
};

// lấy thông tin bác sĩ
const getDoctorDetail = async (req, res) => {
  const { id } = req.params;
  const doctor = await Doctor.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "fullname", "avatar", "phone", "email"],
      },
      {
        model: Rating,
        as: "ratings",
        attributes: ["id", "rating", "comment", "createdAt"],
        limit: 2,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "fullname", "avatar"],
          },
        ],
      },
      {
        model: DoctorHospital,
        as: "doctorHospital",
        attributes: ["id", "hospital_id"],
        include: [
          {
            model: Hospital,
            as: "hospital",
            attributes: ["id", "name", "address"],
          },
        ],
      },
      {
        model: DoctorSpecialty,
        as: "doctorSpecialty",
        attributes: ["id", "hospital_specialty_id", "consultation_fee"],
        include: [
          {
            model: HospitalSpecialty,
            as: "hospitalSpecialty",
            attributes: ["specialty_id"],
            include: [
              {
                model: Specialty,
                as: "specialty",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      },
    ],
  });

  const doctorDetail = {
    id: doctor.id,
    fullname: doctor.user?.fullname,
    avatar: doctor.user?.avatar,
    phone: doctor.user?.phone,
    email: doctor.user?.email,
    description: doctor.description,
    ratings: doctor.ratings.map((rating) => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      user: rating.user.fullname,
      avatar: rating.user.avatar,
      createdAt: rating.createdAt,
    })),
    consultation_fee: doctor.doctorSpecialty.map(
      (specialty) => specialty.consultation_fee
    ),
    hospitals: doctor.doctorHospital.map((hospital) => ({
      id: hospital.hospital.id,
      name: hospital.hospital.name,
      address: hospital.hospital.address,
    })),

    specialties: Array.from(
      new Map(
        doctor.doctorSpecialty?.map((specialty) => [
          specialty.hospitalSpecialty.specialty_id,
          {
            id: specialty.hospitalSpecialty.specialty_id,
            name: specialty.hospitalSpecialty.specialty?.name,
          },
        ])
      ).values()
    ),
  };
  res.status(200).json({ doctorDetail });
};

// lấy danh sách slot theo ngày từ bác sĩ

// const getAppointmentSlotsByDoctorAndDate = async (req, res) => {};

// lấy bác sĩ theo ID
const getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// lấy bác sĩ theo mã chứng chỉ hành nghề
const getDoctorByLicenseCode = async (req, res) => {
  const { licenseCode } = req.query;
  try {
    const doctor = await Doctor.findOne({
      where: { certificate_id: licenseCode },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
    if (doctor) {
      const doctorDetail = {
        id: doctor.id,
        fullname: doctor.user.fullname,
        phone: doctor.user.phone,
        email: doctor.user.email,
        avatar: doctor.user.avatar,
        description: doctor.description,
        certificate_id: doctor.certificate_id,
        gender: doctor.user.gender,
        birthday: doctor.user.date_of_birth,
      };
      res.status(200).json({ doctorDetail });
    } else {
      res.status(200).json({ doctor });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// lấy danh sách bác sĩ online
const getAllDoctorOnline = async (req, res) => {
  const { doctorsOnline } = req.body;
  console.log("doctorsOnline", doctorsOnline);
  try {
    // Điều kiện lọc dựa trên `hospital_id`

    const doctors = await Doctor.findAll({
      where: {
        user_id: doctorsOnline,
      },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: DoctorHospital,
          as: "doctorHospital",
          attributes: ["id", "hospital_id"],
          include: [
            {
              model: Hospital,
              as: "hospital",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: DoctorSpecialty,
          as: "doctorSpecialty",
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
        {
          model: Rating,
          as: "ratings",
          attributes: ["id", "rating", "comment", "createdAt"],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    // Xử lý danh sách bác sĩ và các thông tin liên quan
    const doctorList = doctors.map((doctor) => {
      const ratings = doctor.ratings;
      const totalComments = ratings.length;
      const averageRating =
        totalComments > 0
          ? ratings.reduce((acc, rating) => acc + rating.rating, 0) /
            totalComments
          : 0;
      return {
        id: doctor.id,
        fullname: doctor.user.fullname,
        email: doctor.user.email,
        avatar: doctor.user.avatar,
        description: doctor.description,
        consultation_fee: doctor.doctorSpecialty.map(
          (specialty) => specialty.consultation_fee
        ),
        specialties: Array.from(
          new Map(
            doctor.doctorSpecialty.map((specialty) => [
              specialty.hospitalSpecialty.specialty_id,
              {
                id: specialty.hospitalSpecialty.specialty_id,
                name: specialty.hospitalSpecialty.specialty.name,
              },
            ])
          ).values()
        ),
        averageRating: averageRating.toFixed(1),
        totalComments,
        hospital: doctor.doctorHospital.map((hospital) => ({
          id: hospital.hospital.id,
          name: hospital.hospital.name,
        })),
      };
    });

    // Trả về kết quả
    res.status(200).json({ doctorList });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createDoctor,
  getDoctorOfHospital,
  getDoctorNameList,
  getAllDoctor,
  getDoctorDetail,
  filterDoctor,
  getDoctorById,
  getDoctorByLicenseCode,
  getAllDoctorOnline,
  // createDoctor2,
};
