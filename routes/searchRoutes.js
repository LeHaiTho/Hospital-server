const express = require("express");
const { searchByName } = require("../controllers/searchController");
const router = express.Router();

router.get("/", searchByName);

module.exports = router;
