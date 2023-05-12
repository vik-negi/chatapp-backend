"use strict";

var config = require("config");

var jwt = require("jsonwebtoken");

function auth(req, res, next) {
  var token = req.header("x-amazon-token"); //* Check if there is a token

  if (!token) {
    return res.status(401).json({
      msg: "No token found",
    });
  }

  try {
    //* Verfy the token
    var decoded = jwt.verify(token, config.get("JWT_SECRET_KEY")); //* Store the Amazon user

    req.amazonUser = decoded;
    next();
  } catch (err) {
    res.status(400).json({
      msg: "Token is invalid",
    });
  }
}

module.exports = auth;
