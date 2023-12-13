const router = require("express").Router();
const auth = require("../middleware/auth-middleware");
const AccountController = require("../controllers/account");

router.post("/auth/signin", AccountController.signin);
router.post("/auth/signup", AccountController.signup);
router.post("/auth/forgot-password", AccountController.forgetPassword);
router.post("/auth/verify-otp", AccountController.verifyOtp);
router.post("/auth/reset-password", AccountController.changePasswordOtp);
router.get("/user/:username", AccountController.searchUser);
router.get("/user", auth, AccountController.userInfo);

module.exports = router;
