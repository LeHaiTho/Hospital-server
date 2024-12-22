// Import required modules
const { Package } = require("../models");
const Subscription = require("../models/subscriptionModel");
const { Op } = require("sequelize");

// kiểm tra quyền nhắn tin
const checkSubscription = async (req, res, next) => {
  try {
    // const { id } = req.params;
    const subscription = await Subscription.findAll({
      where: {
        user_id: req.user.id,
        // Kiểm tra end_date có sẵn trong cơ sở dữ liệu
        is_active: true,
      },
      include: [
        {
          model: Package,
          as: "packages",
        },
      ],
    });
    // tính tổng subscription
    return res.status(200).json({ subscription });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to check subscription" });
  }
};
// các gói khám
const getPackage = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.status(200).json(packages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get packages" });
  }
};
module.exports = { checkSubscription, getPackage };
