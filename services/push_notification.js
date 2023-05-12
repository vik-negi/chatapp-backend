exports.SendNotification = async (data, callback) => {
  var headres = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Basic " + process.env.ONESIGNAL_API_KEY,
  };
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headres,
  };
  var https = require("https");
  var req = https.request(options, function (res) {
    res.on("data", function (data) {
      console.log("Response:");
      console.log(data);
      callback(null, JSON.parse(data));
    });
  });
  req.on("error", function (e) {
    console.log("ERROR:");
    console.log(e);
    callback(e, null);
  });
  req.write(JSON.stringify(data));
  req.end();
};
