const PushNotification = require("../controllers/push_notification");
const router = require("express").Router();

router.post("/notifications", PushNotification.SendNotification);
router.post(
  "/notificationToSpecificDevices",
  PushNotification.SendNotificationToSpecificDevices
);

module.exports = router;
