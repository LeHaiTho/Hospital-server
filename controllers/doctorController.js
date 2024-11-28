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
    const { fullname, email, phone, description, specialty } = req.body;

    // create doctor account
    const existingAccount = await User.findOne({
      where: {
        email,
      },
    });

    if (existingAccount) {
      await t.rollback();
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(email, 10);

    const newAccount = await User.create(
      {
        username: email,
        fullname,
        email,
        phone,
        password: hashedPassword,
        role_id: 3,
      },
      { transaction: t }
    );

    // create doctor
    const newDoctor = await Doctor.create(
      {
        description,
      },
      { transaction: t }
    );
    newDoctor.user_id = newAccount.id;
    await newDoctor.save({ transaction: t });

    // Liên kết bác sĩ với chuyên khoa
    // const hospitalSpecialty = await HospitalSpecialty.findAll({
    //   where: {
    //     name: specialty,
    //   },
    // });

    const hospital = await Hospital.findOne({
      where: {
        manager_id: req.user.id,
      },
    });

    const doctorHospital = await DoctorHospital.create(
      {
        doctor_id: newDoctor.id,
        hospital_id: hospital.id,
      },
      { transaction: t }
    );

    const hospitalSpecialtyId = [];

    for (const spe of specialty) {
      const hospitalSpecialty = await HospitalSpecialty.findOne({
        where: {
          specialty_id: spe,
          hospital_id: hospital.id,
        },
      });
      hospitalSpecialtyId.push(hospitalSpecialty.id);
    }
    for (const specialityId of hospitalSpecialtyId) {
      const doctorSpecialty = await DoctorSpecialty.create(
        {
          hospital_specialty_id: specialityId,
          doctor_id: newDoctor.id,
        },
        { transaction: t }
      );
    }
    await t.commit();
    return res.status(200).json({ hospital });
  } catch (error) {
    await t.rollback();
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
        attributes: ["id", "description", "user_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "fullname", "email", "phone", "avatar"],
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
    specialties: item.doctor.doctorSpecialty.map((specialty) => ({
      id: specialty.hospitalSpecialty.specialty_id,
      name: specialty.hospitalSpecialty.specialty.name,
    })),
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
module.exports = {
  createDoctor,
  getDoctorOfHospital,
  getDoctorNameList,
  getAllDoctor,
  getDoctorDetail,
  filterDoctor,
  getDoctorById,
};
