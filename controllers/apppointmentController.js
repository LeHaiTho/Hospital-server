const sequelize = require("../config/database");
const moment = require("moment");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const AppointmentSlot = require("../models/appointmentSlotModel");
const DoctorSchedule = require("../models/doctorScheduleModel");
const Doctor = require("../models/doctorModel");
const Hospital = require("../models/hospitalModel");
const Specialty = require("../models/specialtyModel");
const StaffHospital = require("../models/staffHospitalModel");
const HospitalSpecialty = require("../models/hospitalSpecialtyModel");
const { v4: uuidv4 } = require("uuid");
const {
  createNewAppointmentNotification,
} = require("./notificationController");
const { Op } = require("sequelize");
const {
  PushToken,
  ReminderAppointment,
  FamilyMember,
  DoctorHospital,
  DoctorSpecialty,
} = require("../models");
const { createPayment } = require("./paymentController");
const createAppointment = async (req, res) => {
  const {
    profile,
    reasonForVisit,
    doctor,
    selectedDate,
    slot,
    selectedHospital,
    selectedSpecialty,
    paymentMethod,
    isDoctorSpecial,
  } = req.body;
  console.log(selectedHospital);
  try {
    const generateAppointmentCode = async () => {
      const dateStr = new Date().getFullYear().toString();
      const uniqueId = uuidv4().split("-")[0].toUpperCase(); // Lấy phần đầu của UUID
      return `PK${dateStr}${uniqueId}`;
    };
    const appointmentCode = await generateAppointmentCode();
    const doctorScheduleId = await AppointmentSlot.findOne({
      where: {
        id: slot.id,
      },
    });
    let newAppointment;
    if (paymentMethod === "e-wallet") {
      newAppointment = await Appointment.create({
        appointment_code: appointmentCode,
        user_id: req.user.id,
        hospital_id: selectedHospital?.id || selectedHospital,
        doctor_id: doctor.id,
        specialty_id: selectedSpecialty,
        reason_for_visit: reasonForVisit,
        doctorSchedule_id: doctorScheduleId.doctorSchedule_id,
        appointmentSlot_id: slot.id,
        appointment_date: selectedDate,
        payment_method: paymentMethod,
        status: "confirmed", // mới sửa
        price:
          selectedHospital?.hospitalSpecialty?.[0]?.consultation_fee ||
          doctor.consultation_fee[0],
        payment_status: "paid",
        isDoctorSpecial: true,
      });
    } else {
      newAppointment = await Appointment.create({
        appointment_code: appointmentCode,
        user_id: req.user.id,
        hospital_id: selectedHospital?.id || selectedHospital,
        doctor_id: doctor.id,
        specialty_id: selectedSpecialty,
        reason_for_visit: reasonForVisit,
        doctorSchedule_id: doctorScheduleId.doctorSchedule_id,
        appointmentSlot_id: slot.id,
        appointment_date: selectedDate,
        payment_method: paymentMethod,
        status: "confirmed",
        price:
          selectedHospital?.hospitalSpecialty?.[0]?.consultation_fee ||
          doctor.consultation_fee[0],
        payment_status: "pending",
        isDoctorSpecial: isDoctorSpecial,
      });
    }

    if (profile.relationship) {
      await Appointment.update(
        {
          familyMember_id: profile.id,
        },
        {
          where: {
            id: newAppointment.id,
          },
        }
      );
    }

    if (slot.id) {
      await AppointmentSlot.update(
        {
          isBooked: true,
        },
        {
          where: {
            id: slot.id,
          },
        }
      );
      const slotTime = await AppointmentSlot.findOne({
        where: {
          id: slot.id,
        },
      });
    }
    const now = moment().tz("Asia/Bangkok").toDate();
    //   // thời gian gửi nhắc nhở
    const reminderTime = [
      moment(now).add(1, "minutes").toDate(),
      moment(now).add(3, "minutes").toDate(),
    ];

    const hospitalName = await Hospital.findOne({
      where: {
        id: selectedHospital?.id || selectedHospital,
      },
    });

    await createNewAppointmentNotification(
      req.user.id,
      newAppointment.id,
      hospitalName.name,
      moment(selectedDate).format("DD/MM/YYYY")
    );

    reminderTime.forEach(async (time) => {
      await ReminderAppointment.create({
        appointment_id: newAppointment.id,
        reminder_time: time,
      });
    });

    res.status(200).json({
      message: "Appointment created successfully",
      newAppointment,
    });
  } catch (error) {
    console.log(error);
  }
};

// lấy lịch hẹn sắp tới của người dùng
const getAppointmentsByUserId = async (req, res) => {
  try {
    // điều kiện lọc
    const { status, payment_status, payment_method, appointment_date } =
      req.query;

    let filterCondition = {
      user_id: req.user.id,
    };
    if (status) {
      filterCondition.status = status;
    }
    const appointments = await Appointment.findAll({
      where: filterCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date"],
        },
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["status", "ASC"],
        ["doctorSchedule", "date", "ASC"],
        [
          { model: AppointmentSlot, as: "appointmentSlot" },
          "start_time",
          "ASC",
        ],
      ],
    });

    const appointmentList = appointments?.map((appointment) => {
      return {
        id: appointment.id,
        status: appointment.status,
        payment_status: appointment.payment_status,
        payment_method: appointment.payment_method,
        reason: appointment.reason_for_visit,
        appointmentSlot: appointment.appointmentSlot,
        doctorSchedule: appointment.doctorSchedule,
        appointment_code: appointment.appointment_code,
        doctor: {
          id: appointment.doctor.id,
          fullname: appointment.doctor.user.fullname,
          avatar: appointment.doctor.user.avatar,
        },
        hospital: appointment.hospital,
        specialty: appointment.specialty,
        patient: appointment.user,
      };
    });
    res.status(200).json({
      message: "Get appointment successfully",
      appointmentList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get appointment",
    });
  }
};

// lấy chi tiết lịch hẹn theo id
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  // nếu khác role customer
  const condition =
    role && role === "customer" ? { id, user_id: userId } : { id };
  try {
    const appointment = await Appointment.findOne({
      where: condition,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: FamilyMember,
          as: "familyMembers",
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date", "slot_duration"],
        },
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!appointment) {
      return res.status(404).json({
        message:
          role === "customer"
            ? "Không tìm thấy lịch hẹn của bạn với ID được cung cấp."
            : "Không tìm thấy lịch hẹn với ID được cung cấp.",
      });
    }
    const appointmentDetail = {
      id: appointment.id,
      status: appointment.status,
      payment_status: appointment.payment_status,
      payment_method: appointment.payment_method,
      reason: appointment.reason_for_visit,
      appointmentSlot: appointment.appointmentSlot,
      appointmentFee: appointment.price,

      doctorSchedule: appointment.doctorSchedule,
      appointment_code: appointment.appointment_code,

      doctor: {
        id: appointment.doctor.id,
        fullname: appointment.doctor.user.fullname,
        avatar: appointment.doctor.user.avatar,
      },
      hospital: appointment.hospital,
      specialty: appointment.specialty,
      patient: appointment.user,
      member: appointment.familyMembers,
    };
    res.status(200).json({
      message: "Get appointment successfully",
      appointmentDetail,
    });
  } catch (error) {
    console.log(error);
  }
};

// lấy chi tiết lịch hẹn theo id (theo hệ thống bệnh viện khác API)
const getAppointmentByIdByHospital = async (req, res) => {
  const { id } = req.params;
  // nếu khác role customer
  try {
    const appointment = await Appointment.findOne({
      where: { appointment_code: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: FamilyMember,
          as: "familyMembers",
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date", "slot_duration"],
        },
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!appointment) {
      return res.status(404).json({
        status: 404,
        message:
          "Không tìm thấy lịch hẹn với ID được cung cấp. Vui lòng kiểm tra lại.",
      });
    }

    const appointmentDetail = {
      id: appointment.id,
      status: appointment.status,
      payment_status: appointment.payment_status,
      payment_method: appointment.payment_method,
      reason: appointment.reason_for_visit,
      appointmentSlot: appointment.appointmentSlot,
      appointmentFee: appointment.price,

      doctorSchedule: appointment.doctorSchedule,
      appointment_code: appointment.appointment_code,

      doctor: {
        id: appointment.doctor.id,
        fullname: appointment.doctor.user.fullname,
        avatar: appointment.doctor.user.avatar,
      },
      hospital: appointment.hospital,
      specialty: appointment.specialty,
      patient: appointment.user,
      member: appointment.familyMembers,
      appointment_date: appointment.appointment_date,
    };
    res.status(200).json({
      status: 200,
      message: "Get appointment successfully",
      appointmentDetail,
    });
  } catch (error) {
    console.log(error);
  }
};
// lịch hẹn đã hoàn thành theo id
const getAppointmentCompletedById = async (req, res) => {
  try {
    const { id } = req.params;

    // Điều kiện lấy dữ liệu
    const whereCondition = {
      status: "completed",
    };

    if (id === String(req.user.id)) {
      // Lấy tất cả lịch hẹn đã hoàn thành của user chính
      whereCondition.user_id = req.user.id;
      whereCondition.familyMember_id = null;
    } else {
      // Lấy lịch hẹn đã hoàn thành theo memberID
      whereCondition.familyMember_id = id;
    }

    const appointment = await Appointment.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: FamilyMember,
          as: "familyMembers",
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date", "slot_duration"],
        },
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      message: "Get appointment completed successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// danh sách lịch hẹn của bệnh viện (dựa vào id của staff và bệnh viện)
const getAllAppointmentsByHospitalId = async (req, res) => {
  try {
    const staffOfHospital = await StaffHospital.findOne({
      where: {
        user_id: req.user.id,
      },
    });
    console.log(staffOfHospital);
    const appointments = await Appointment.findAll({
      where: {
        hospital_id: staffOfHospital.hospital_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["status", "ASC"],
        ["doctorSchedule", "date", "ASC"],
        [
          { model: AppointmentSlot, as: "appointmentSlot" },
          "start_time",
          "ASC",
        ],
      ],
    });

    const appointmentList = appointments?.map((appointment) => {
      return {
        id: appointment.id,
        status: appointment.status,
        payment_status: appointment.payment_status,
        payment_method: appointment.payment_method,
        reason: appointment.reason_for_visit,
        appointmentSlot: appointment.appointmentSlot,
        doctorSchedule: appointment.doctorSchedule,
        appointment_code: appointment.appointment_code,
        doctor: {
          id: appointment.doctor.id,
          fullname: appointment.doctor.user.fullname,
        },
        hospital: appointment.hospital,
        specialty: appointment.specialty,
        patient: appointment.user,
        members: appointment.user.familyMembers,
        // appointment_date: appointment.appointment_date,
      };
    });
    res.status(200).json({
      message: "Get appointment successfully",
      appointmentList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get appointment",
    });
  }
};

// cập nhật trạng thái lịch hẹn
const updateAppointmentStatusById = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedAppointment = await Appointment.update(
      { status, staff_id: req.user.id, updatedAt: new Date() },
      { where: { id } }
    );
    const appointmentSlotId = await Appointment.findOne({
      where: { id },
      attributes: ["appointmentSlot_id"],
    });
    const changeSlotStatus = await AppointmentSlot.update(
      { isBooked: false },
      { where: { id: appointmentSlotId.appointmentSlot_id } }
    );
    const appointment = await Appointment.findOne({
      where: { id },
    });
    const user = await User.findOne({
      where: {
        id: appointment.user_id,
      },
    });
    const hospitalName = await Hospital.findOne({
      where: {
        id: appointment.hospital_id,
      },
    });
    const appointmentDate = moment(appointment.appointment_date).format(
      "DD/MM/YYYY"
    );

    if (updatedAppointment) {
      await createAppointmentNotification(
        user.id,
        id,
        hospitalName.name,
        appointmentDate,
        status
      );
    }
    res.status(200).json({
      message: "Update appointment status successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update appointment status",
    });
  }
};

// lấy lịch hẹn gần tới
const getAppointmentSoon = async (req, res) => {
  try {
    const appointmentList = await Appointment.findAll({
      where: {
        user_id: req.user.id,
        appointment_date: {
          [Op.gte]: new Date(),
        },
        status: "confirmed",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "fullname",
            "phone",
            "address",
            "avatar",
            "gender",
            "date_of_birth",
          ],
        },
        {
          model: FamilyMember,
          as: "familyMembers",
        },
        {
          model: AppointmentSlot,
          as: "appointmentSlot",
          attributes: ["id", "start_time", "end_time"],
        },
        {
          model: DoctorSchedule,
          as: "doctorSchedule",
          attributes: ["id", "date", "slot_duration"],
        },
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
        {
          model: Specialty,
          as: "specialty",
          attributes: ["id", "name"],
        },
      ],
    });
    const appointmentSoon = appointmentList?.map((appointment) => {
      return {
        id: appointment.id,
        status: appointment.status,
        payment_status: appointment.payment_status,
        payment_method: appointment.payment_method,
        reason: appointment.reason_for_visit,
        appointmentSlot: appointment.appointmentSlot,

        doctorSchedule: appointment.doctorSchedule,
        appointment_code: appointment.appointment_code,
        doctor: {
          id: appointment.doctor.id,
          fullname: appointment.doctor.user.fullname,
          avatar: appointment.doctor.user.avatar,
        },
        hospital: appointment.hospital,
        specialty: appointment.specialty,
        patient: appointment.user,
        member: appointment.familyMembers,
      };
    });
    res.status(200).json({
      appointmentSoon,
    });
  } catch (error) {
    console.log(error);
  }
};

// lấy ra những cuộc hẹn đang cần cảnh báo dời lịch
const getAppointmentNeedChange = async (req, res) => {
  try {
    const appointmentNeedChange = await Appointment.findAll({
      where: {
        status: "waiting",
        user_id: req.user.id,
        isDoctorSpecial: true,
      },
      include: [
        {
          model: Hospital,
          as: "hospital",
        },
        {
          model: Doctor,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
      ],
    });
    res.status(200).json({
      appointmentNeedChange,
    });
  } catch (error) {
    console.log(error);
  }
};

// đề xuất lịch hẹn mới (khác bác sĩ + chuyên khoa + giá tiền + bệnh viện + giờ khám)
// const suggestAppointment = async (req, res) => {
//   const { appointmentNeedChange } = req.body;
//   try {
//     const originalAppointment = await Appointment.findOne({
//       where: {
//         id: appointmentNeedChange,
//         status: "waiting",
//       },
//       include: [
//         {
//           model: Hospital,
//           as: "hospital",
//         },
//         {
//           model: Specialty,
//           as: "specialty",
//         },
//         {
//           model: Doctor,
//           as: "doctor",
//         },
//         {
//           model: DoctorSchedule,
//           as: "doctorSchedule",
//         },
//         {
//           model: AppointmentSlot,
//           as: "appointmentSlot",
//         },
//       ],
//     });

//     // lấy thông tin bác sĩ khác cùng giờ khám
//     const doctorsOfHospital = await DoctorHospital.findAll({
//       where: {
//         hospital_id: originalAppointment.hospital_id,
//         doctor_id: {
//           [Op.ne]: originalAppointment.doctor_id,
//         },
//       },
//       include: [
//         {
//           model: Doctor,
//           as: "doctor",
//           include: [
//             {
//               model: User,
//               as: "user",
//             },
//           ],
//         },
//       ],
//     });
//     const hospitalAndSpecial = await HospitalSpecialty.findOne({
//       where: {
//         hospital_id: originalAppointment.hospital_id,
//         specialty_id: originalAppointment.specialty_id,
//       },
//     });
//     // già khám của bác sĩ ban đầu
//     const doctorFee = await DoctorSpecialty.findOne({
//       where: {
//         hospital_specialty_id: hospitalAndSpecial.id,
//         doctor_id: originalAppointment.doctor_id,
//       },
//     });

//     // lấy ra những bác sĩ cùng chuyên khoa và cùng giá khám
//     const doctorWithSpecialtyOfHospital = await DoctorSpecialty.findAll({
//       where: {
//         hospital_specialty_id: hospitalAndSpecial.id,
//         doctor_id: doctorsOfHospital.map((doctor) => doctor.doctor_id),
//         consultation_fee: doctorFee.consultation_fee,
//       },
//     });
//     // lấy ra những bác sĩ cùng ngày  khám
//     const doctorScheduleDate = await DoctorSchedule.findAll({
//       where: {
//         date: originalAppointment.doctorSchedule.date,
//         doctor_id: doctorWithSpecialtyOfHospital.map(
//           (doctor) => doctor.doctor_id
//         ),
//       },
//     });
//     const appointmentSlot = await AppointmentSlot.findAll({
//       where: {
//         doctorSchedule_id: doctorScheduleDate.map((doctor) => doctor.id),
//         isBooked: false,
//         isDeleted: false,
//         start_time: {
//           [Op.gte]: originalAppointment.appointmentSlot.start_time,
//         },
//         end_time: {
//           [Op.lte]: originalAppointment.appointmentSlot.end_time,
//         },
//       },
//     });

//     res.status(200).json({
//       originalAppointment,
//       doctorsOfHospital,
//       hospitalAndSpecial,
//       doctorFee,
//       doctorWithSpecialtyOfHospital,
//       doctorScheduleDate,
//       appointmentSlot,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
const suggestAppointment = async (req, res) => {
  const { appointmentNeedChange } = req.body;

  try {
    const originalAppointment = await Appointment.findOne({
      where: {
        id: appointmentNeedChange,
        status: "waiting",
      },
      include: [
        { model: Hospital, as: "hospital" },
        { model: Specialty, as: "specialty" },
        { model: Doctor, as: "doctor" },
        { model: DoctorSchedule, as: "doctorSchedule" },
        { model: AppointmentSlot, as: "appointmentSlot" },
      ],
    });

    if (!originalAppointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or not in waiting status." });
    }

    const hospitalAndSpecial = await HospitalSpecialty.findOne({
      where: {
        hospital_id: originalAppointment.hospital_id,
        specialty_id: originalAppointment.specialty_id,
      },
    });

    if (!hospitalAndSpecial) {
      return res
        .status(404)
        .json({ message: "No matching hospital-specialty found." });
    }

    const doctorFee = await DoctorSpecialty.findOne({
      where: {
        hospital_specialty_id: hospitalAndSpecial.id,
        doctor_id: originalAppointment.doctor_id,
      },
    });

    const doctorsWithMatchingFee = await DoctorSpecialty.findAll({
      where: {
        hospital_specialty_id: hospitalAndSpecial.id,
        consultation_fee: doctorFee.consultation_fee,
        doctor_id: {
          [Op.ne]: originalAppointment.doctor_id,
        },
      },
      include: [
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    const doctorIds = doctorsWithMatchingFee.map((doc) => doc.doctor_id);

    const availableSchedules = await DoctorSchedule.findAll({
      where: {
        date: originalAppointment.doctorSchedule.date,
        doctor_id: doctorIds,
      },
    });

    const scheduleIds = availableSchedules.map((schedule) => schedule.id);

    const availableSlots = await AppointmentSlot.findAll({
      where: {
        doctorSchedule_id: scheduleIds,
        isBooked: false,
        isDeleted: false,
        start_time: {
          [Op.gte]: originalAppointment.appointmentSlot.start_time,
        },
        end_time: {
          [Op.lte]: originalAppointment.appointmentSlot.end_time,
        },
      },
      include: [{ model: DoctorSchedule, as: "doctorSchedule" }], // Include thông tin DoctorSchedule
    });

    // if (availableSlots.length === 0) {
    //   return res.status(200).json({ message: "No available slots found." });
    // }

    res.status(200).json({
      suggestedAppointments: availableSlots.map((slot) => ({
        slot,
        doctor: doctorsWithMatchingFee.find(
          (doc) => doc.doctor_id === slot.doctorSchedule.doctor_id
        ),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching suggestions.",
      error,
    });
  }
};
// khách hàng thay đổi lịch hẹn sang lịch hẹn mới
const changeAppointment = async (req, res) => {
  const {
    original_appointment_id,
    doctor_id,
    user_id,
    familyMember_id,
    hospital_id,
    doctorSchedule_id,
    appointmentSlot_id,
    specialty_id,
    reason_for_visit,
    appointment_date,
    payment_status,
    payment_method,
  } = req.body;
  try {
    const generateAppointmentCode = async () => {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const count = (await Appointment.count()) || 0; // Đảm bảo count không null
      return `PK${dateStr}${(count + 1).toString().padStart(4, "0")}`;
    };
    const appointmentCode = await generateAppointmentCode();
    const newChangeAppointment = await Appointment.create({
      appointment_code: appointmentCode,
      original_appointment_id,
      doctor_id,
      user_id,
      hospital_id,
      doctorSchedule_id,
      appointmentSlot_id,
      specialty_id,
      reason_for_visit,
      appointment_date,
      payment_status,
      payment_method,
      status: "confirmed",
    });
    if (familyMember_id) {
      await Appointment.update(
        { familyMember_id },
        { where: { id: newChangeAppointment.id } }
      );
    }
    // cập nhật lịch hẹn của bác sĩ
    await AppointmentSlot.update(
      { isBooked: true },
      { where: { id: appointmentSlot_id } }
    );
    // cập nhật trạng thái lịch hẹn của lịch hẹn cũ
    await Appointment.update(
      { status: "updated" },
      { where: { id: original_appointment_id } }
    );
    const now = moment().tz("Asia/Bangkok").toDate();
    //   // thời gian gửi nhắc nhở
    const reminderTime = [
      moment(now).add(1, "minutes").toDate(),
      moment(now).add(3, "minutes").toDate(),
    ];

    const hospitalName = await Hospital.findOne({
      where: {
        id: hospital_id,
      },
    });

    await createNewAppointmentNotification(
      req.user.id,
      newChangeAppointment.id,
      hospitalName.name,
      moment(appointment_date).format("DD/MM/YYYY")
    );

    reminderTime.forEach(async (time) => {
      await ReminderAppointment.create({
        appointment_id: newChangeAppointment.id,
        reminder_time: time,
      });
    });

    res.status(200).json({
      message: "Change appointment successfully",
      newChangeAppointment,
    });
  } catch (error) {
    console.log(error);
  }
};

// hủy lịch hẹn
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const cancelAppointment = await Appointment.update(
      { status: "cancelled", isDeleted: true },
      { where: { id: id } }
    );
    const appointment = await Appointment.findOne({
      where: { id },
      attributes: ["appointmentSlot_id"],
    });
    // cập nhật lại lịch hẹn của bác sĩ
    await AppointmentSlot.update(
      { isBooked: false },
      { where: { id: appointment.appointmentSlot_id } }
    );

    if (cancelAppointment) {
      res.status(200).json({ message: "Cancel appointment successfully" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createAppointment,
  getAppointmentsByUserId,
  getAllAppointmentsByHospitalId,
  updateAppointmentStatusById,
  getAppointmentById,
  getAppointmentSoon,
  getAppointmentNeedChange,
  suggestAppointment,
  changeAppointment,
  getAppointmentCompletedById,
  cancelAppointment,
  getAppointmentByIdByHospital,
};
