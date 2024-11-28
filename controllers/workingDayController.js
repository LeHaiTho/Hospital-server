const { WorkingDay, Hospital, TimeSlot } = require("../models");
const moment = require("moment");
const createWorkingDayForHospital = async (req, res) => {
  const { working_day } = req.body;

  const manager_id = req.user.id;
  try {
    const hospital = await Hospital.findOne({
      where: {
        manager_id: manager_id,
      },
    });
    for (const day in working_day) {
      if (working_day[day].length > 0) {
        const [workingDay, created] = await WorkingDay.findOrCreate({
          where: {
            hospital_id: hospital.id,
            date_of_week: day,
          },
          defaults: {
            hospital_id: hospital.id,
            date_of_week: day,
          },
        });

        const shift_type = (index) => {
          if (index === 0) {
            return "morning";
          } else if (index === 1) {
            return "afternoon";
          }
          return "evening";
        };
        // create time slot
        const timeSlots = working_day[day].map((time) => ({
          working_day_id: workingDay.id,
          shift_type: shift_type(working_day[day].indexOf(time)),
          start_time: moment(time.start).format("HH:mm:ss"),
          end_time: moment(time.end).format("HH:mm:ss"),
        }));
        await TimeSlot.bulkCreate(timeSlots);
      }
    }
    res.status(200).json({
      message: "Cập nhật thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
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

module.exports = {
  createWorkingDayForHospital,
  getHospitalWorkingDaysTimeSlots,
};
