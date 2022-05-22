import express from "express";
const router = express.Router();


// middleware
import { requireSignin } from "../middlewares";
// controller
import { makeInstructor, currentInstructor, getCourse } from '../controllers/instructor';


router.post("/make-instructor", requireSignin, makeInstructor);
router.get("/current-instructor", requireSignin, currentInstructor);
router.get("/courses", requireSignin, getCourse);

// router.get("/test-email", sendEmailToUserTest);

module.exports = router;
