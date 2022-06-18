import expressJwt from 'express-jwt';
import Course from '../models/course';
import User from "../models/user";


export const requireSignin = expressJwt({
    getToken: (req, res) => req.cookies.token,
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
});

export const isInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).exec();
        if(!user.role.includes("Instructor")){
            return res.sendStatus(403);
        } else {
            next();
        }
    } catch (error) {
        res.sendStatus(403);
    }
};

export const isEnroll = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).exec();
        let query;

        if (req.params.slug) {
            query = {slug: req.params.slug};
        } else {
            query = {_id: req.body.courseId};
        }

        const course = await Course.findOne(query).exec();
        if (!course || !user.courses.includes(course._id)) {
            return res.sendStatus(403);    
        }
        // req.course = course;
        next();
    } catch (error) {
        res.sendStatus(403);
    }
};
