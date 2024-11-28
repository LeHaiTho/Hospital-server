const PushToken = require("../models/pushTokenModel");
const sequelize = require("../config/database");

const createPushToken = async (req, res) => {
  const { pushToken } = req.body;
  try {
    const existingPushToken = await PushToken.findOne({
      where: {
        user_id: req.user?.id,
      },
    });
    if (existingPushToken) {
      await existingPushToken.update({
        pushToken,
      });
    } else {
      await PushToken.create({
        pushToken,
        user_id: req.user.id,
      });
    }
    res.status(200).json({
      message: "Push token created successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deletePushToken = async (req, res) => {
  try {
    await PushToken.destroy({
      where: {
        user_id: req.body.user_id,
      },
    });
    res.status(200).json({
      message: "Push token deleted successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPushToken,
  deletePushToken,
};
