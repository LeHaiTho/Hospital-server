const sequelize = require("../config/database");
const chat = async (req, res) => {
  const { text } = req.body;
  try {
    console.log(text);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { chat };
