const { WorkingDay, Hospital, TimeSlot } = require("../models");
const moment = require("moment");
const sequelize = require("../config/database");

// const createWorkingDayForHospital = async (req, res) => {
//   const { working_day } = req.body;

//   const manager_id = req.user.id;
//   try {
//     const hospital = await Hospital.findOne({
//       where: {
//         manager_id: manager_id,
//       },
//     });
//     for (const day in working_day) {
//       if (working_day[day].length > 0) {
//         const [workingDay, created] = await WorkingDay.findOrCreate({
//           where: {
//             hospital_id: hospital.id,
//             date_of_week: day,
//           },
//           defaults: {
//             hospital_id: hospital.id,
//             date_of_week: day,
//           },
//         });

//         const shift_type = (index) => {
//           if (index === 0) {
//             return "morning";
//           } else if (index === 1) {
//             return "afternoon";
//           }
//           return "evening";
//         };
//         // create time slot
//         const timeSlots = working_day[day].map((time) => ({
//           working_day_id: workingDay.id,
//           shift_type: shift_type(working_day[day].indexOf(time)),
//           start_time: moment(time.start).format("HH:mm:ss"),
//           end_time: moment(time.end).format("HH:mm:ss"),
//         }));
//         await TimeSlot.bulkCreate(timeSlots);
//       }
//     }
//     res.status(200).json({
//       message: "Cập nhật thành công",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

const createWorkingDayForHospital = async (req, res) => {
  const { working_day } = req.body;
  const manager_id = req.user.id;

  // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
  const transaction = await sequelize.transaction();

  try {
    // Tìm thông tin bệnh viện dựa trên manager_id
    const hospital = await Hospital.findOne({
      where: { manager_id },
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Duyệt qua từng ngày làm việc
    for (const day in working_day) {
      if (working_day[day].length > 0) {
        // Tìm hoặc tạo một bản ghi WorkingDay cho ngày đó
        const [workingDay] = await WorkingDay.findOrCreate({
          where: {
            hospital_id: hospital.id,
            date_of_week: day,
          },
          defaults: {
            hospital_id: hospital.id,
            date_of_week: day,
          },
          transaction,
        });

        // Tạo danh sách timeSlots từ dữ liệu client
        const timeSlots = working_day[day].map((time) => ({
          working_day_id: workingDay.id,
          shift_type: time.title, // Lấy trực tiếp từ client
          start_time: moment(time.start, "HH:mm").format("HH:mm:ss"),
          end_time: moment(time.end, "HH:mm").format("HH:mm:ss"),
        }));

        // Tạo các bản ghi TimeSlot trong cơ sở dữ liệu
        await TimeSlot.bulkCreate(timeSlots, { transaction });
      }
    }

    // Commit transaction nếu mọi thứ đều thành công
    await transaction.commit();
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (error) {
    // Rollback transaction nếu xảy ra lỗi
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHospitalWorkingDaysTimeSlots = async (req, res) => {
  const manager_id = req.user.id;
  try {
    const hospital = await Hospital.findOne({
      where: { manager_id },
    });
    const workingDays = await WorkingDay.findAll({
      where: { hospital_id: hospital.id },
      include: [
        {
          model: TimeSlot,
          as: "timeSlots",
          attributes: ["id", "shift_type", "start_time", "end_time"],
        },
      ],
    });

    const workingDaysWithTimeSlots = workingDays.map((workingDay) => ({
      ...workingDay.get(),
      timeSlots: workingDay.timeSlots,
    }));

    res.status(200).json({
      workingDays: workingDaysWithTimeSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
// lấy thời gian làm việc của bệnh viện để render lên calendar
const getHospitalScheduleForCalendar = async (req, res) => {
  try {
    const currentManager = await Hospital.findOne({
      where: {
        manager_id: req.user.id,
      },
    });
    const workingDays = await WorkingDay.findAll({
      where: {
        hospital_id: currentManager.id,
      },
      include: [
        {
          model: TimeSlot,
          as: "timeSlots",
          attributes: ["id", "shift_type", "start_time", "end_time"],
        },
      ],
    });

    res.status(200).json(workingDays);
  } catch (error) {
    console.log("Error getting hospital schedule for calendar:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createWorkingDayForHospital,
  getHospitalWorkingDaysTimeSlots,
  getHospitalScheduleForCalendar,
};
