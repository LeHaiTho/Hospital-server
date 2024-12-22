const express = require("express");
const {
  createPayment,
  callbackPayment,
  createPackagePayment,
  callbackPackagePayment,
} = require("../controllers/paymentController");

const router = express.Router();

// router.post("/create-payment", createPayment);
// router.post("/callbackPayment", callbackPayment);
// package
router.post("/createPackagePayment", createPackagePayment);
router.post("/callbackPackagePayment", callbackPackagePayment);

module.exports = router;
