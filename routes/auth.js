import express from "express";
const router = express.Router();


// middleware
import { requireSignin } from "../middlewares";
// controller
import { register, login, logout, currentUser, forgetPassword, resetPassword } from '../controllers/auth';

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

router.get("/current-user", requireSignin, currentUser);

// router.get("/test-email", sendEmailToUserTest);

module.exports = router;
