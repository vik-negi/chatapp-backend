const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
var dbme = process.env.MONGODBURI;
var db = process.env.MONGODB_URI;

console.log("dbme", dbme);
console.log("db", db);

const conn = mongoose.createConnection(db, options);
const connMe = mongoose.createConnection(dbme, options);

module.exports = { conn, connMe };
