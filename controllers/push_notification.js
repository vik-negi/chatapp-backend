const pushNotification = require("../services/push_notification");

class PushNotification {
  static SendNotificationInternal = async (data) => {
    const { messageData, title, small_icon, large_icon, deviceNotificationId } =
      data;
    var message = {
      app_id: process.env.ONESIGNAL_APP_ID,
      contents: { en: messageData },
      headings: { en: title },
      included_segments: ["include_player_ids"],
      content_available: true,
      small_icon: small_icon,
      include_player_ids: deviceNotificationId,
      large_icon: large_icon,
      data: {
        pushTitle: "CUSTOM NOTIFICATION",
      },
    };

    pushNotification.SendNotification(message, (err, data) => {
      if (err) {
        console.log(err);
        return false;
      } else {
        console.log(data);
        return true;
      }
    });
  };
  static SendNotification = async (req, res, next) => {
    console.log("req.body", req.body);
    //   const { messageData, title } = req.body;
    var message = {
      app_id: process.env.ONESIGNAL_APP_ID,
      contents: { en: req.body.messageData },
      headings: { en: req.body.title },
      included_segments: ["All"],
      content_available: true,
      small_icon: "ic_notification_icon",
      data: {
        pushTitle: "CUSTOM NOTIFICATION",
      },
    };

    pushNotification.SendNotification(message, (err, data) => {
      if (err) {
        console.log(err);
        return next(err);
      } else {
        console.log(data);
        return res.status(200).json({
          status: "success",
          data: data,
        });
      }
    });
  };

  static SendNotificationToSpecificDevices = async (req, res, next) => {
    var message = {
      app_id: process.env.ONESIGNAL_APP_ID,
      contents: { en: req.body.messageData },
      headings: { en: req.body.title },
      include_segments: ["include_player_ids"],
      content_available: true,
      small_icon: "ic_notification_icon",
      include_player_ids: req.body.devices,
      data: {
        pushTitle: "CUSTOM NOTIFICATION",
      },
    };
    pushNotification.SendNotification(message, (err, data) => {
      if (err) {
        console.log(err);
        return next(err);
      } else {
        console.log(data);
        return res.status(200).json({
          status: "success",
          data: data,
        });
      }
    });
  };
}

module.exports = PushNotification;
