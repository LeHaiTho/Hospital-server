require("dotenv").config({ path: "../.env" });
const sequelize = require("../config/database");
const axios = require("axios");
const { ACCESS_KEY, SECRET_KEY } = process.env;
const crypto = require("crypto");
const Appointment = require("../models/appointmentModel");
const { Subscription } = require("../models");

// const createPayment = async (req, res) => {
//   const { appointment } = req.body;
//   var orderInfo = "Thanh toán lịch hẹn";
//   var partnerCode = "MOMO";
//   var redirectUrl = "exp://hospital-lht";
//   var ipnUrl =
//     "https://8041-2001-ee0-51ec-1920-6877-8b0d-acc4-a31b.ngrok-free.app/payments/callbackPayment";
//   var requestType = "captureWallet";
//   var amount = appointment.amount;
//   var orderId = partnerCode + new Date().getTime();
//   var requestId = orderId;
//   const extraData = JSON.stringify({
//     appointmentId: appointment.id,
//   });
//   var paymentCode =
//     "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
//   var orderGroupId = "";
//   var autoCapture = true;
//   var lang = "vi";
//   //before sign HMAC SHA256 with format
//   //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
//   var rawSignature =
//     "accessKey=" +
//     ACCESS_KEY +
//     "&amount=" +
//     amount +
//     "&extraData=" +
//     extraData +
//     "&ipnUrl=" +
//     ipnUrl +
//     "&orderId=" +
//     orderId +
//     "&orderInfo=" +
//     orderInfo +
//     "&partnerCode=" +
//     partnerCode +
//     "&redirectUrl=" +
//     redirectUrl +
//     "&requestId=" +
//     requestId +
//     "&requestType=" +
//     requestType;
//   //puts raw signature
//   console.log("--------------------RAW SIGNATURE----------------");
//   console.log(rawSignature);
//   //signature
//   const crypto = require("crypto");
//   var signature = crypto
//     .createHmac("sha256", SECRET_KEY)
//     .update(rawSignature)
//     .digest("hex");
//   console.log("--------------------SIGNATURE----------------");
//   console.log(signature);

//   //json object send to MoMo endpoint
//   const requestBody = JSON.stringify({
//     partnerCode: partnerCode,
//     partnerName: "Test",
//     storeId: "MomoTestStore",
//     requestId: requestId,
//     amount: amount,
//     orderId: orderId,
//     orderInfo: orderInfo,
//     redirectUrl: redirectUrl,
//     ipnUrl: ipnUrl,
//     lang: lang,
//     requestType: requestType,
//     autoCapture: autoCapture,
//     extraData: extraData,
//     orderGroupId: orderGroupId,
//     signature: signature,
//   });
//   //Create the HTTPS objects
//   const options = {
//     method: "POST",
//     url: "https://test-payment.momo.vn/v2/gateway/api/create",
//     headers: {
//       "Content-Type": "application/json",
//       "Content-Length": Buffer.byteLength(requestBody),
//     },
//     data: requestBody,
//   };
//   let result;
//   try {
//     result = await axios(options);
//     res.status(200).json(result.data);
//   } catch (error) {
//     console.log(error);
//   }
// };
// const generateSignature = (rawSignature) => {
//   return crypto
//     .createHmac("sha256", process.env.SECRET_KEY)
//     .update(rawSignature)
//     .digest("hex");
// };
// const callbackPayment = async (req, res) => {
//   const { orderId } = req.body;
//   const appointmentId = JSON.parse(req.body.extraData).appointmentId;
//   console.log("appointmentId", appointmentId);
//   const rawSignature = `accessKey=${ACCESS_KEY}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
//   const signature = generateSignature(rawSignature);
//   try {
//     const requestBody = JSON.stringify({
//       partnerCode: "MOMO",
//       requestId: orderId,
//       orderId,
//       signature,
//       lang: "vi",
//     });
//     const options = {
//       method: "POST",
//       url: "https://test-payment.momo.vn/v2/gateway/api/query",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       data: requestBody,
//     };
//     const result = await axios(options);
//     if (result.data.resultCode === 0) {
//       await Appointment.update(
//         { status: "confirmed", payment_status: "paid" },
//         { where: { id: appointmentId } }
//       );
//       return res.status(200).json({ success: true, data: result.data });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Payment failed", data: result.data });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Thanh toán Package
const createPackagePayment = async (req, res) => {
  const { package } = req.body;
  console.log("package", package);
  var orderInfo = "Thanh toán lịch hẹn";
  var partnerCode = "MOMO";
  var redirectUrl = "exp://hospital-lht";
  var ipnUrl =
    "https://a660-14-164-38-239.ngrok-free.app/payments/callbackPackagePayment";
  var requestType = "captureWallet";
  var amount = package.price;
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  const extraData = JSON.stringify({
    packageId: package,
  });
  var paymentCode =
    "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";
  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    ACCESS_KEY +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });
  //Create the HTTPS objects
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  let result;
  try {
    result = await axios(options);
    res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
  }
};
const generateSignature2 = (rawSignature) => {
  return crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(rawSignature)
    .digest("hex");
};
const callbackPackagePayment = async (req, res) => {
  const { orderId } = req.body;
  console.log("ddddddddddddddddddddddddddddd", orderId);
  const packageId = JSON.parse(req.body.extraData).packageId;
  console.log("packageId", packageId);
  const rawSignature = `accessKey=${ACCESS_KEY}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
  const signature = generateSignature2(rawSignature);
  try {
    const requestBody = JSON.stringify({
      partnerCode: "MOMO",
      requestId: orderId,
      orderId,
      signature,
      lang: "vi",
    });
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    };
    const result = await axios(options);
    if (result.data.resultCode === 0) {
      await Subscription.create({
        user_id: packageId.user_id,
        package_id: packageId.id,
      });
      console.log("result", result.data);
      console.log("packageId", packageId);
      return res.status(200).json({ success: true, data: result.data });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment failed", data: result.data });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  // createPayment,
  // callbackPayment,
  createPackagePayment,
  callbackPackagePayment,
};
