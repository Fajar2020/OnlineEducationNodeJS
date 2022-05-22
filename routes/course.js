import express from "express";
import formidableMiddleware from "express-formidable";

const router = express.Router();

// middleware
import { requireSignin, isInstructor} from "../middlewares";
// controller
import { create, edit, read, deleteLesson, addLesson, editLesson } from '../controllers/course';


router.post("/create", requireSignin, isInstructor, create);
router.put("/edit/:courseId", requireSignin, isInstructor, edit);
router.put("/delete-lesson/:lessonId", requireSignin, isInstructor, deleteLesson);
router.get("/:slug", read);
router.post("/add-lesson/:courseId", formidableMiddleware(), requireSignin, isInstructor, addLesson);
router.put("/edit-lesson/:courseId", formidableMiddleware(), requireSignin, isInstructor, editLesson);

module.exports = router;
