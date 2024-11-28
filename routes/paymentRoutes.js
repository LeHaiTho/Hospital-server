const express = require("express");
const {
  createPayment,
  callbackPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/callbackPayment", callbackPayment);

module.exports = router;
