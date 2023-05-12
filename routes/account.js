const router = require("express").Router();
const auth = require("../middleware/auth-middleware");
const AccountController = require("../controllers/account");

router.post("/auth/signup", AccountController.signup);
router.post("/auth/signin", AccountController.signin);
router.get("/user/:username", AccountController.searchUser);
router.get("/user", auth, AccountController.userInfo);

module.exports = router;
