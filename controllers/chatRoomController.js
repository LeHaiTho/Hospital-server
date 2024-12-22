const sequelize = require("../config/database");
const { ChatRoom, Doctor } = require("../models");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const { Op } = require("sequelize");

const createChatRoom = async (req, res) => {
  const { patient_id, doctor_id } = req.body;

  try {
    let chatRoom = await ChatRoom.findOne({
      where: {
        user_id: patient_id,
        doctor_id: doctor_id,
      },
    });
    const chatRoomID = `room-${patient_id}-${doctor_id}`;
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        room_id: chatRoomID,
        user_id: patient_id,
        doctor_id: doctor_id,
      });
    }
    res.status(200).json({
      message: "Chat room created successfully",
      chatRoom,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// get all chat room of doctor và thông tin user của từng chat room
const getChatRooms = async (req, res) => {
  const { doctor_id } = req.params;
  try {
    // const chatRooms = await ChatRoom.findAll({
    //   where: { doctor_id },
    //   include: [
    //     {
    //       model: User,
    //       as: "user",
    //       attributes: {
    //         exclude: [
    //           "password",
    //           "identity_card",
    //           "password",
    //           "email",
    //           "phone",
    //         ],
    //       },
    //     },
    //   ],
    // });
    // const chatRoom_Id = chatRooms.map((chatRoom) => chatRoom.room_id);
    // const messages = await Message.findAll({
    //   where: {
    //     room_id: {
    //       [Op.in]: chatRoom_Id,
    //     },
    //   },
    //   order: [["createdAt", "DESC"]],
    // });

    // res.status(200).json({ chatRooms });
    const rooms = await ChatRoom.findAll({
      where: {
        doctor_id,
      },
      include: [
        {
          model: Message,
          as: "messages",
          attributes: ["content", "createdAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "avatar", "gender", "date_of_birth"],
        },
      ],
    });

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch chat rooms" });
  }
};

module.exports = { createChatRoom, getChatRooms };
