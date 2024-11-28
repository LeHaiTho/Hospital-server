const slugify = require("slugify");
const moment = require("moment");

const createSlug = (name, id) => {
  return slugify(name, { lower: true, strict: true });
};

const generateDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = moment(startDate, "YYYY/MM/DD");
  const end = moment(endDate, "YYYY/MM/DD");
  while (currentDate.isSameOrBefore(end)) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }
  return dates;
};

const createSlots = (startDate, endDate, slotDuration) => {
  const slots = [];
  let start = moment(startDate, "HH:mm");
  const end = moment(endDate, "HH:mm");

  while (start < end) {
    const slotEnd = moment(start).add(slotDuration, "minutes");
    if (start > end) break;
    slots.push({
      start: start.format("HH:mm"),
      end: slotEnd.format("HH:mm"),
    });
    start = slotEnd;
  }
  return slots;
};

module.exports = {
  createSlug,
  generateDatesBetween,
  createSlots,
};
