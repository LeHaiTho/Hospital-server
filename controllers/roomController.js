const Hospital = require("../models/hospitalModel");
const Room = require("../models/roomModel");

const createRoom = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  try {
    const hospital = await Hospital.findOne({ where: { manager_id: userId } });
    const room = await Room.create({ name, hospital_id: hospital.id });
    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getListRoom = async (req, res) => {
  const userId = req.user.id;
  try {
    const hospital = await Hospital.findOne({ where: { manager_id: userId } });
    const rooms = await Room.findAll({
      where: { hospital_id: hospital.id },
    });
    res.status(200).json({ rooms });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
module.exports = { createRoom, getListRoom };
