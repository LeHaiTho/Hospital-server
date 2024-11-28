const sequelize = require("../config/database");
const DoctorUnavailableTime = require("../models/doctorUnavailableTimeModel");
const Appointment = require("../models/appointmentModel");
const { Op } = require("sequelize");
const moment = require("moment");
const { Doctor, Hospital, AppointmentSlot } = require("../models");
const User = require("../models/userModel");
const DoctorSchedule = require("../models/doctorScheduleModel");
const createDoctorUnavailableTime = async (req, res) => {
  const { workplace, fromDate, fromTime, toDate, toTime, reason, title } =
    req.body;
  try {
    const unavailable_start_date = moment(
      `${fromDate} ${fromTime}`,
      "DD/MM/YYYY HH:mm"
    ).toDate();
    const unavailable_end_date = moment(
      `${toDate} ${toTime}`,
      "DD/MM/YYYY HH:mm"
    ).toDate();

    const currentDoctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });
    const doctorUnavailableTime = await DoctorUnavailableTime.create({
      doctor_id: currentDoctor.id,
      hospital_id: workplace,
      unavailable_start_date,
      unavailable_end_date,
      reason,
      title,
      status: "pending",
    });
    res.status(200).json({
      message: "Doctor unavailable time created",
      doctorUnavailableTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// lấy danh sách lịch hẹn nằm trong khoảng thời gian bác sĩ không khả dụng
const appointmentByDoctorUnavailableTime = async (req, res) => {
  const {
    doctor_id,
    hospital_id,
    unavailable_start_date,
    unavailable_end_date,
  } = req.body;
  try {
    const start = moment(unavailable_start_date)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const end = moment(unavailable_end_date)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    console.log("start", start);
    console.log("end", end);
    const appointment = await Appointment.findAll({
      where: {
        doctor_id,
        hospital_id,
        appointment_date: {
          [Op.between]: [start, end],
        },
      },
    });
    res.status(200).json({ message: "Appointment found", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
const getDoctorUnavailableTimeList = async (req, res) => {
  try {
    const currentDoctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });
    const doctorUnavailableTime = await DoctorUnavailableTime.findAll({
      where: {
        doctor_id: currentDoctor.id,
      },

      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ doctorUnavailableTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
const getDoctorUnavailableTimeListByHospital = async (req, res) => {
  try {
    const currentHospital = await Hospital.findOne({
      where: {
        manager_id: req.user.id,
      },
    });
    const doctorUnavailableTime = await DoctorUnavailableTime.findAll({
      where: {
        hospital_id: currentHospital.id,
      },
      include: [
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullname", "avatar"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ doctorUnavailableTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

// update status

const updateDoctorUnavailableTimeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const currentHospital = await Hospital.findOne({
      where: {
        manager_id: req.user.id,
      },
    });
    // Cập nhật trạng thái của thời gian nghỉ bác sĩ
    await DoctorUnavailableTime.update(
      { status, updatedAt: new Date() },
      { where: { id, hospital_id: currentHospital.id } }
    );

    if (status === "approved") {
      // Lấy thông tin thời gian nghỉ bác sĩ
      const doctorUnavailableTime = await DoctorUnavailableTime.findOne({
        where: { id },
        include: [
          {
            model: Doctor,
            as: "doctor",
          },
        ],
      });

      if (!doctorUnavailableTime) {
        return res
          .status(404)
          .json({ message: "Doctor unavailable time not found" });
      }

      const { doctor_id, unavailable_start_date, unavailable_end_date } =
        doctorUnavailableTime;

      // Chuyển đổi ngày bắt đầu và kết thúc nghỉ bác sĩ về định dạng 'YYYY-MM-DD'

      // Tìm tất cả các cuộc hẹn có ngày nằm trong khoảng thời gian nghỉ
      const appointments = await Appointment.findAll({
        where: {
          doctor_id: doctor_id,
          hospital_id: currentHospital.id,
        },
      });
      const appointmentDates = appointments.filter((item) => {
        if (
          moment(unavailable_start_date).format("DD/MM/YYYY") >=
            moment(item.appointment_date).format("DD/MM/YYYY") &&
          moment(unavailable_end_date).format("DD/MM/YYYY") <=
            moment(item.appointment_date).format("DD/MM/YYYY")
        ) {
          return item;
        }
      });

      // cập nhật trạng thái của lịch hẹn thuộc khoảng thời gian nghỉ là waiting để đợi khách hàng chọn lịch khác
      const updateAppointmentInUnavailableTime = appointmentDates.map(
        async (item) => {
          if (item.status === "confirmed") {
            const updateAppointment = await Appointment.update(
              { status: "waiting", updatedAt: new Date() },
              { where: { id: item.id } }
            );
          }
        }
      );

      // đề xuất gợi ý lịch khám mới cho khách hàng

      // lấy những slot khám của bác sĩ thuộc khoảng thời gian nghỉ, isDeleted (true) để ẩn đi
      const doctorSchedule = await DoctorSchedule.findAll({
        where: {
          doctor_id: doctor_id,
          hospital_id: currentHospital.id,
        },
      });
      const doctorScheduleDate = doctorSchedule.filter(
        (item) =>
          moment(item.date).format("DD/MM/YYYY") >=
            moment(unavailable_start_date).format("DD/MM/YYYY") &&
          moment(item.date).format("DD/MM/YYYY") <=
            moment(unavailable_end_date).format("DD/MM/YYYY")
      );
      const getSlotInUnavailableTime = await AppointmentSlot.findAll({
        where: {
          doctorSchedule_id: doctorScheduleDate.map((item) => item.id),
        },
      });

      const updateSlotInUnavailableTime = getSlotInUnavailableTime.map(
        (item) => {
          item.update({ isDeleted: true });
        }
      );
      // cập nhật trạng thái của slot khám thuộc khoảng thời gian nghỉ là isDeleted = true
      res.status(200).json({
        appointmentDates,
        doctorScheduleDate,
        getSlotInUnavailableTime,
        updateSlotInUnavailableTime,
      });
    } else {
      res
        .status(200)
        .json({ message: "Doctor unavailable time status updated" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error updating doctor unavailable time:", error);
  }
};

module.exports = {
  createDoctorUnavailableTime,
  appointmentByDoctorUnavailableTime,
  getDoctorUnavailableTimeList,
  getDoctorUnavailableTimeListByHospital,
  updateDoctorUnavailableTimeStatus,
};
