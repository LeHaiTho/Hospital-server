const sequelize = require("../config/database");
const Notification = require("../models/notificationModel");
const PushToken = require("../models/pushTokenModel");
const Appointment = require("../models/appointmentModel");

const { Op } = require("sequelize");

const createNotification = async (userId, type, data, url) => {
  const template = generateNotification(type, data);
  const expoPushToken = await PushToken.findOne({
    where: {
      user_id: userId,
    },
  });
  await Notification.create({
    user_id: userId,
    type: type,
    title: template?.title,
    body: template?.body,
    data: data,
    url: url,
    status: "unread",
  });
  if (expoPushToken) {
    await sendNotification(
      expoPushToken.pushToken,
      template?.title,
      template?.body,
      url
    );
  }
};
const createNewAppointmentNotification = async (
  userId,
  appointmentId,
  hospitalName,
  appointmentDate
) => {
  const data = {
    appointment_id: appointmentId,
    hospital_name: hospitalName,
    appointment_date: appointmentDate,
  };
  await createNotification(
    userId,
    "appointment_confirmed",
    data,
    `appointments/get-appointment-by-id/${appointmentId}`
  );
};
const createAppointmentReminder = async (
  userId,
  appointmentId,
  hospitalName,
  appointmentDate,
  appointmentSlot
) => {
  const data = {
    appointmentSlot: appointmentSlot.start_time,
    hospital_name: hospitalName,
    appointment_date: appointmentDate,
    appointment_id: appointmentId,
    appointmentSlot,
  };
  await createNotification(
    userId,
    "reminder",
    data,
    `appointments/get-appointment-by-id/${appointmentId}`
  );
};

const sendNotification = async (expoPushToken, title, body, url) => {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title,
      subtitle: "LHT Booking 🏥",
      body: body,
      data: { url: url },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// const createNotification = async (userId, type, data, template, url) => {
//   // tạo template thông báo
//   const notificationTitle = template?.title?.replace(
//     /{(\w+)}/g,
//     (_, key) => data[key] || ""
//   );
//   const notificationBody = template?.body?.replace(
//     /{(\w+)}/g,
//     (_, key) => data[key] || ""
//   );

//   const expoPushToken = await PushToken.findOne({
//     where: {
//       user_id: userId,
//     },
//   });

//   await Notification.create({
//     user_id: userId,
//     type: type,
//     title: notificationTitle, // Ví dụ: "Bệnh viện ABC đã xác nhận lịch hẹn của bạn"
//     body: notificationBody, // Nội dung ngắn của thông báo
//     data: data,
//     url: url, // Đường dẫn chuyển đến chi tiết liên quan
//   });
//   sendNotification(
//     expoPushToken.pushToken,
//     // notificationTitle,,
//     "hello",
//     notificationBody,
//     url
//   );
// }; viết lại ở trên cùng

// generate notification for appointment
// const generateAppointmentNotification = (appointmentStatus, data) => {
//   let template;
//   switch (appointmentStatus) {
//     case "confirmed":
//       template = {
//         title: `Lịch hẹn tại ${data.hospital_name} đã được xác nhận`,
//         body: `Lịch hẹn của bạn vào ngày ${data.appointment_date} đã được xác nhận.`,
//       };
//       break;
//     case "cancelled":
//       template = {
//         title: `Lịch hẹn tại ${data.hospital_name} đã bị hủy`,
//         body: `Lịch hẹn của bạn vào ngày ${data.appointment_date} đã bị hủy.`,
//       };
//       break;
//     default:
//       break;
//   }
//   return template;
// };
// viết lại
const generateNotification = (type, data) => {
  switch (type) {
    case "appointment_confirmed":
      return {
        title: `Đăng ký lịch hẹn thành công`,
        body: `Bạn đã đăng ký lịch hẹn thành công tại ${data.hospital_name} vào ngày ${data.appointment_date}`,
      };
    case "appointment_cancelled":
      return {
        title: `Hủy lịch hẹn`,
        body: `Bạn đã hủy lịch hẹn thành công tại ${data.hospital_name} vào ngày ${data.appointment_date}`,
      };
    case "reminder":
      return {
        title: `Nhắc nhở cuộc hẹn`,
        body: `Bạn có một cuộc hẹn vào ngày ${data.appointment_date} tại ${data.hospital_name} lúc ${data.appointmentSlot}`,
      };
    default:
      return {
        title: "Thông báo",
        body: "Bạn có một thông báo mới",
      };
  }
};

// const createAppointmentNotification = async (
//   userId,
//   appointmentId,
//   hospitalName,
//   appointmentDate,
//   appointmentStatus
// ) => {
//   const data = {
//     appointment_id: appointmentId,
//     hospital_name: hospitalName,
//     appointment_date: appointmentDate,
//     appointment_status: appointmentStatus,
//   };
//   const template = generateAppointmentNotification(appointmentStatus, data);
//   await createNotification(
//     userId,
//     "appointment",
//     data,
//     template,
//     `appointment/${appointmentId}`
//   );
// };

// get notification by user id
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    // Tạo danh sách notificationDetails
    const notificationDetails = notifications?.map((notification) => {
      // Giả sử notification.data là một JSON string, bạn cần phân tích nó
      const data = notification.data; // Đã được lưu trữ dưới dạng JSON

      // Lấy trạng thái lịch hẹn
      const appointmentStatus = data.appointment_status;

      // Tạo nội dung thông báo
      const template = generateNotification(notification?.type, data);

      return {
        id: notification?.id,
        user_id: notification?.user_id,
        type: notification?.type,
        title: template?.title, // Lấy title từ template
        body: template?.body, // Lấy body từ template
        status: notification?.status,
        createdAt: notification?.createdAt,
        updatedAt: notification?.updatedAt,
        url: notification?.url,
        data: data, // Dữ liệu gốc nếu cần
      };
    });

    res.status(200).json({
      notificationDetails,
    });
  } catch (error) {
    console.error("Error getting notification:", error);
  }
};

// mark notification as read
const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await Notification.update(
      { status: "read" },
      { where: { id, user_id: req.user.id } }
    );
    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// mark all notification as read
const markAllNotificationAsRead = async (req, res) => {
  try {
    await Notification.update(
      { status: "read" },
      { where: { user_id: req.user.id } }
    );
    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

// async function createAppointmentNotification(
//   userId,
//   appointmentId,
//   hospitalName,
//   appointmentDate,
//   appointmentStatus
// ) {
//   let template;

//   if (appointmentStatus === "confirmed") {
//     template = {
//       title: `Lịch hẹn tại {hospital_name} đã được xác nhận`,
//       body: `Lịch hẹn của bạn vào ngày {appointment_date} đã được xác nhận.`,
//     };
//   }

//   await createNotification(
//     userId,
//     "appointment",
//     {
//       appointment_id: appointmentId,
//       hospital_name: hospitalName,
//       appointment_date: appointmentDate,
//     },
//     template,
//     `appointment/${appointmentId}`
//   );
// }

module.exports = {
  sendNotification,
  createNotification,
  createNewAppointmentNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
  createAppointmentReminder,
};
