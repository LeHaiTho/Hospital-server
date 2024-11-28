const sequelize = require("../config/database");
const { Role, FamilyMember } = require("../models");
const Hospital = require("../models/hospitalModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

const createAccount = async (req, res) => {
  const { username, roleName } = req.body;
  try {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }

    const generatedPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newAccount = await User.create({
      username,
      password: hashedPassword,
      role_id: role.id,
      isActived: false,
    });

    // send email to new user account
    const htmlContentForDoctorAndStaff = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #007bff;">Chào mừng đến với hệ thống quản lý đặt lịch khám online</h2>
      <p style="color: #000000;">Xin chào,</p>
      <p style="color: #000000;">Chúng tôi rất vui khi bạn trở thành một phần của hệ thống đặt lịch khám bệnh viện trực tuyến.</p>
      <p style="color: #000000;">Tài khoản của bạn đã được tạo và dưới đây là thông tin đăng nhập:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; color: #333;">
        <p style="color: #000000;"><strong>Tài khoản:</strong> ${username}</p>
        <p style="color: #000000;"><strong>Mật khẩu:</strong> ${generatedPassword}</p>
      </div>
      <p style="color: #000000;">Vui lòng đăng nhập vào hệ thống và thay đổi mật khẩu của bạn ngay sau lần đăng nhập đầu tiên để kích hoạt tài khoản và đảm bảo tính bảo mật.</p>
      <p style="color: #000000;">Sau khi kích hoạt, bạn có thể xem và quản lý lịch hẹn, cũng như thực hiện các thao tác theo vai trò của mình.</p>
      <p style="color: #000000;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
      <p style="color: #000000;">Trân trọng,</p>
      <p style="font-weight: bold; color: #000000;">Hệ thống quản lý đặt lịch khám online</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://yourwebsite.com" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Đăng nhập hệ thống</a>
      </div>
    </div>
  </div>`;

    await sendEmail({
      to: username,
      subject: "Cấp tài khoản quản lý",
      html: htmlContentForDoctorAndStaff,
    });

    res.status(200).json({
      message: `Tài khoản ${roleName} đã được tạo thành công, vui lòng kiểm tra email để kích hoạt tài khoản`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Có lỗi khi tạo tài khoản" });
  }
};
// create profile for patient
const createProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      province,
      district,
      ward,
      address,
      identificationCard,
      relationship,
    } = req.body;
    console.log(req.body);

    if (relationship === "myself") {
      const updatedProfile = await User.update(
        {
          fullname: name,
          phone,
          email,
          date_of_birth: dateOfBirth,
          gender,
          province,
          district,
          ward,
          address,
          identity_card: identificationCard,
        },
        { where: { id: req.params.id } }
      );
    } else {
      const newFamilyMember = await FamilyMember.create(
        {
          user_id: req.params.id,
          fullname: name,
          phone,
          email,
          date_of_birth: dateOfBirth,
          gender,
          province,
          district,
          ward,
          address,
          identity_card: identificationCard,
          relationship,
        },
        { where: { user_id: req.params.id } }
      );
    }
    res.status(200).json({
      message: "Tạo hồ sơ bệnh nhân thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Có lỗi khi tạo hồ sơ bệnh nhân" });
  }
};

const getAllProfileOfUser = async (req, res) => {
  try {
    const profile = await User.findByPk(req.user.id, {
      attributes: {
        exclude: [
          "password",
          "role_id",
          "isActivated",
          "isFirstLogin",
          "username",
          "user_id",
          "activationToken",
        ],
      },
    });
    const getMembersOfUser = await FamilyMember.findAll({
      where: { user_id: req.user.id },
    });
    res.status(200).json({ profile, getMembersOfUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Có lỗi khi lấy hồ sơ bệnh nhân" });
  }
};

module.exports = {
  createAccount,
  createProfile,
  getAllProfileOfUser,
};
