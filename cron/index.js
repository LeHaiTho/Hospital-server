const reminderCron = require("./reminderCron");

const startCron = () => {
  reminderCron();
  console.log("Cron job started");
};

module.exports = { startCron };
