const router = require("express").Router();
const auth = require("../middleware/auth-middleware");
const AccountController = require("../controllers/account");
const checkUserAuth = require("../middleware/auth-middleware");

router.post("/auth/signin", AccountController.signin);
router.post("/auth/signup", AccountController.signup);
router.post("/auth/forgot-password", AccountController.forgetPassword);
router.post("/auth/verify-otp", checkUserAuth, AccountController.verifyOtp);
router.post(
  "/auth/reset-password",
  checkUserAuth,
  AccountController.changePasswordOtp
);
router.get("/user/:username", AccountController.searchUser);
router.get("/user", auth, AccountController.userInfo);

module.exports = router;
