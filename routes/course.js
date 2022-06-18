import express from "express";
import formidableMiddleware from "express-formidable";

const router = express.Router();

// middleware
import { requireSignin, isInstructor, isEnroll} from "../middlewares";
// controller
import { 
    read,
    create, 
    edit, 
    deleteLesson, 
    addLesson, 
    editLesson, 
    publishCourse, 
    unPublishCourse
} from '../controllers/course';

import { 
    getCourses,
    enrollCourse,
    getUserCourses,
    getCourse,
    markCompleted,
    markIncomplete
} from '../controllers/studentcourse';

// for student
router.get("/", getCourses);
router.post("/enroll", requireSignin, enrollCourse);
router.get("/user-courses", requireSignin, getUserCourses);
router.get("/student/course/:slug", requireSignin, isEnroll, getCourse);
router.post("/lesson/mark-completed", requireSignin, isEnroll, markCompleted, getCourse);
router.post("/lesson/mark-incomplete", requireSignin, isEnroll, markIncomplete, getCourse);

// instructor only
router.get("/read/:slug", requireSignin, isInstructor, read);
router.post("/create", requireSignin, isInstructor, create);
router.put("/edit/:courseId", requireSignin, isInstructor, edit);
router.put("/delete-lesson/:lessonId", requireSignin, isInstructor, deleteLesson);
router.post("/add-lesson/:courseId", formidableMiddleware(), requireSignin, isInstructor, addLesson);
router.put("/edit-lesson/:courseId", formidableMiddleware(), requireSignin, isInstructor, editLesson);
router.put("/publish/:courseId", formidableMiddleware(), requireSignin, isInstructor, publishCourse);
router.put("/unpublish/:courseId", formidableMiddleware(), requireSignin, isInstructor, unPublishCourse);

module.exports = router;
