const sequelize = require("../config/database");
const {
  Role,
  HospitalSpecialty,
  WorkingDay,
  Specialty,
  Doctor,
  DoctorHospital,
  DoctorSpecialty,
} = require("../models");
const Hospital = require("../models/hospitalModel");
const WorkingHour = require("../models/workingHourModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sendEmail } = require("../services/emailService");
const { Json } = require("sequelize/lib/utils");
const moment = require("moment");
const HospitalShift = require("../models/hospitalShiftModel");

const createHospital = async (req, res) => {
  const t = await sequelize.transaction();
  const { name, address, email } = req.body;

  try {
    // validate input
    if (!name || !address || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if hospital already exists
    const existingHospital = await Hospital.findOne({
      where: {
        [Op.or]: [
          {
            email: email,
          },
          { name: name },
        ],
      },
      transaction: t,
    });
    if (existingHospital) {
      await t.rollback();
      return res.status(400).json({
        message:
          existingHospital.email === email
            ? "Email đã được sử dụng"
            : "Tên bệnh viện đã được sử dụng",
      });
    }

    // create hospital
    const newHospital = await Hospital.create(
      { name, address, email },
      { transaction: t }
    );

    // check if manager exists
    const manager = await Role.findOne({ where: { name: "manager" } });
    if (!manager) {
      return res.status(400).json({ message: "Manager not found" });
    }

    // create generate password
    const generatedPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // create manager
    const manager_hospital = await User.create(
      {
        username: email,
        password: hashedPassword,
        role_id: manager.id,
        isActivated: false,
        isFirstLogin: true,
      },
      { transaction: t }
    );

    // gán manager vào hospital
    newHospital.manager_id = manager_hospital.id;
    await newHospital.save({ transaction: t });

    // send email to manager
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #007bff;">Chào mừng đến với hệ thống quản lý đặt lịch khám online</h2>
        <p style="color: #000000;">Xin chào,</p> <!-- Màu chữ là đen -->
        <p style="color: #000000;">Hệ thống quản lý đặt lịch khám online rất vui khi được cộng tác cùng bạn.</p>
        <p style="color: #000000;">Dưới đây là tài khoản và mật khẩu của bạn để có thể quản lý bệnh viện hoạt động trên hệ thống:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; color: #333;">
          <p style="color: #000000;"><strong>Tài khoản:</strong> ${newHospital.email}</p>
          <p style="color: #000000;"><strong>Mật khẩu:</strong> ${generatedPassword}</p>
        </div>
        <p style="color: #000000;">Vui lòng đăng nhập vào hệ thống và thay đổi mật khẩu của bạn ngay sau lần đăng nhập đầu tiên để đảm bảo tính bảo mật.</p>
        <p style="color: #000000;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
        <p style="color: #000000;">Trân trọng,</p>
        <p style="font-weight: bold; color: #000000;">Hệ thống quản lý đặt lịch khám online</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://yourwebsite.com" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Đăng nhập hệ thống</a>
        </div>
      </div>
    </div>`;

    await sendEmail({
      to: email,
      subject: "Account Created",
      html: htmlContent,
    });
    await t.commit();
    res.status(201).json({
      message: "Hospital and manager account created successfully",
      newHospital,
      manager_hospital,
    });
  } catch (error) {
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getListHospital = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["username"],
        },
      ],
    });
    res.status(200).json({ hospitals });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByPk(id);
    await hospital.destroy();
    res.status(200).json({ message: "Hospital deleted succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    let hospital;
    if (req.user && req.user.role === "manager") {
      hospital = await Hospital.findOne({
        where: {
          manager_id: req.user.id,
        },
      });
      return res.status(200).json({ hospital });
    } else {
      const { id } = req.params;
      hospital = await Hospital.findByPk(id);
      return res.status(200).json({ hospital });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateHospital = async (req, res) => {
  const managerId = req.user.id;
  const { name, address, email, description, latitude, longitude } = req.body;
  const { avatar, banner } = req.files || {};

  try {
    // kiểm tra xem địa chỉ
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const hospital = await Hospital.findOne({
      where: {
        manager_id: managerId,
      },
    });
    if (avatar && avatar[0]) {
      const avatarUrl = `/uploads/${avatar[0].filename}`;
      hospital.avatar = avatarUrl;
    }

    if (banner && banner[0]) {
      const bannerUrl = `/uploads/${banner[0].filename}`;
      hospital.banner = bannerUrl;
    }
    if (!latitude || latitude === "" || !longitude || longitude === "") {
      const location = await getHospitalLocation(address);
      hospital.latitude = location.items[0].position.lat;
      hospital.longitude = location.items[0].position.lng;
      console.log(hospital.latitude);
      console.log(hospital.longitude);
    } else {
      hospital.latitude = latitude;
      hospital.longitude = longitude;
    }
    hospital.name = name;
    hospital.address = address;
    hospital.email = email;
    hospital.description = description;

    await hospital.save();
    res
      .status(200)
      .json({ message: "Cập nhật thông tin bệnh viện thành công!", hospital });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getHospital_shiftTyes = async (req, res) => {
  const managerId = req.user.id;
  try {
    const hospitalShift = await Hospital.findOne({
      where: {
        manager_id: managerId,
      },
      attributes: [
        "morning_start",
        "morning_end",
        "afternoon_start",
        "afternoon_end",
        "evening_start",
        "evening_end",
      ],
    });
    // add hospital shift to object
    const shiftTypes = {
      morning: {
        start: hospitalShift.morning_start,
        end: hospitalShift.morning_end,
      },
      afternoon: {
        start: hospitalShift.afternoon_start,
        end: hospitalShift.afternoon_end,
      },
      evening: {
        start: hospitalShift.evening_start,
        end: hospitalShift.evening_end,
      },
    };
    // Nếu hospitalShift không tồn tại
    if (!hospitalShift) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.status(200).json({ shiftTypes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Định nghĩa lấy tọa độ bệnh viện
const getHospitalLocation = async (address) => {
  // dùng openstreetmap để lấy tọa độ
  const HERE_API_KEY = "te9pF-AZqdY4Dez0jND9_-Eh_Xpe7DWthoixEhgtmeE";

  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
    address
  )}&apiKey=${HERE_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// hàm tính khoảng cách giữa 2 điểm
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất tính bằng km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // khoảng cách tính bằng km
};

// endpoint lọc bệnh viện theo khoảng cách gần vị trí khách hàng
const getHospitalNearBy = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll();
    const { latitude, longitude } = req.query;
    console.log(latitude, longitude);
    const hospitalsNearBy = hospitals
      .map((hospital) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );

        // Làm tròn khoảng cách đến 2 chữ số thập phân
        const roundedDistance = Math.round(distance * 100) / 100;

        return { ...hospital.get(), distance: roundedDistance };
      })
      .sort((a, b) => a.distance - b.distance)
      .filter((hospital) => hospital.distance <= 10);

    res.status(200).json({ hospitalsNearBy });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// // endpoint lấy vị trí theo IP
const getCityFromIp = async (ip) => {
  const apiKey = "2e556970f0c04ee1a5af51ebc4b3e5a1";
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// const getHospitalNearBy = async (req, res) => {
//   const { ip } = req.query;
//   const city = await getCityFromIp(ip);
//   console.log(city);
// };
const getHospitalDetail = async (req, res) => {
  const { id } = req.params;
  const hospital = await Hospital.findByPk(id, {
    include: [
      {
        model: HospitalSpecialty,
        as: "hospitalSpecialty",
        include: [{ model: Specialty, as: "specialty" }],
      },
      {
        model: WorkingDay,
        as: "workingDays",
      },
    ],
  });
  res.status(200).json({ hospital });
};
const getHospitalConditions = async (req, res) => {
  const { province, name } = req.query;
  let condition = {};
  if (name) {
    condition.name = {
      [Op.iLike]: `%${name}%`,
    };
  }
  if (province) {
    condition.address = {
      [Op.iLike]: `%${province}%`,
    };
  }
  try {
    const hospital = await Hospital.findAll({
      where: condition,
    });
    res.status(200).json({ hospital });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
  // const hospital = await Hospital.findAll({
  //   where: {
  //     address: {
  //       [Op.like]: `%${province}%`,
  //     },
  //   },
  // });
  // res.status(200).json({ hospital });

  // try {
  //   const filterHospital = await Hospital.findAll({
  //     where: {
  //       address: {
  //         [Op.like]: `%${province}%`,
  //       },
  //     },
  //   });
  //   res.status(200).json({ filterHospital });
  // } catch (error) {
  //   res
  //     .status(500)
  //     .json({ message: "Internal server error", error: error.message });
  // }
};
module.exports = {
  createHospital,
  getHospital_shiftTyes,
  getListHospital,
  deleteHospital,
  getHospitalById,
  updateHospital,
  getHospitalNearBy,
  getHospitalDetail,
  getHospitalConditions,
};
