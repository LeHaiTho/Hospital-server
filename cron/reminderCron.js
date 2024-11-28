const cron = require("node-cron");
const moment = require("moment-timezone");
const Appointment = require("../models/appointmentModel");
const ReminderAppointment = require("../models/reminderAppointmentModel");
const User = require("../models/userModel");
const AppointmentSlot = require("../models/appointmentSlotModel");
const Hospital = require("../models/hospitalModel");
const { sendNotification } = require("../controllers/notificationController");
const PushToken = require("../models/pushTokenModel");
const {
  createAppointmentReminder,
} = require("../controllers/notificationController");

const sendReminder = async () => {
  try {
    const currentTime = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm");
    const reminderAppointments = await ReminderAppointment.findAll({});

    reminderAppointments.forEach(async (appointment) => {
      const reminderTimeFormatted = moment(appointment.reminder_time).format(
        "YYYY-MM-DD HH:mm"
      );
      if (reminderTimeFormatted === currentTime) {
        const appointmentDetail = await Appointment.findOne({
          where: {
            id: appointment.appointment_id,
          },
          include: [
            {
              model: User,
              as: "user",
            },
            {
              model: AppointmentSlot,
              as: "appointmentSlot",
              attributes: ["id", "start_time", "end_time"],
            },
            {
              model: Hospital,
              as: "hospital",
            },
          ],
        });
        // get expo push token

        await createAppointmentReminder(
          appointmentDetail.user.id,
          appointmentDetail.id,
          appointmentDetail.hospital.name,
          moment(appointmentDetail.appointment_date).format("DD/MM/YYYY"),
          moment(
            appointmentDetail.appointmentSlot.start_time,
            "HH:mm:ss"
          ).format("HH:mm")
        );
        await ReminderAppointment.update(
          { status: "sent" },
          { where: { id: appointment.id } }
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// Gọi hàm để thực hiện

const reminderCron = () => {
  cron.schedule("* * * * *", async () => {
    await sendReminder();
  });
};
module.exports = reminderCron;
