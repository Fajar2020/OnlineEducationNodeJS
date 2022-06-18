import Completed from "../models/completed";
import Course from "../models/course";
import User from "../models/user";

// student
export const getCourses = async (req, res) => {
    try {
        const { slug, instructor, title } = req.query;
        let query = { published: true };
        if (slug) {
            query = {...query, slug}
        }

        if (instructor) {
            query = {...query, instructor}
        }

        if (title) {
            query = {...query, name:/.*${title}.*/}
        }
        console.log(query);
        
        const courses = await Course.find(query).populate("instructor", "_id name").exec();
        if (courses.length) {
            courses.forEach(course => {
                if (course && course.lessons) {
                    course.lessons.forEach(element => {
                        if (element.video) {
                            if (element.free_preview) {
                                element.video = process.env.HOST_URL+element.video.substring(1, element.video.length);
                            } else {
                                element.video = "";
                            }
                        }
                    });
                }
            });
        }
        
        res.json(courses);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const enrollCourse = async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await Course.findById(courseId).exec();
        const user = await User.findById(req.user).exec();
        let alreadyEnroll = false;

        if (!course) return res.status(400).send("Course not exists");
        if (user.courses) {
            user.courses.forEach(element => {
                if (element.toString() === course._id.toString()) {
                    alreadyEnroll = true;
                }
            });
        }

        if (alreadyEnroll) return res.status(400).send("Already enroll");

        // in normal case it should difference between paid and free course
        // since no payment for this learning project we treat it all as free courses

        // addToSet to avoid duplicate id
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $addToSet: {courses: course._id}
        }, {new: true}).exec();
        res.json({
            message: "Successfully to enroll",
            user: updatedUser
        });
    } catch (error) {
        return res.status(400).send("Fail to enroll");
    }
}

export const getUserCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).exec();
        const courses = await Course.find({_id: {$in: user.courses}}).populate("instructor", "_id name").exec();
        res.json(courses);    
    } catch (error) {
        return res.status(400).send("Fail to load course");
    }
}

export const getCourse = async (req, res) => {
    try {
        let query;

        if (req.params.slug) {
            query = {slug: req.params.slug};
        } else {
            query = {_id: req.body.courseId};
        }
        const course = await Course.findOne(query).populate("instructor", "_id name").exec();
        const completed = await Completed.findOne({
            user: req.user._id,
            course: course._id
        }).exec();

        if (!course) {
            return res.sendStatus(400)
        }
        if (course.lessons) {
            course.lessons.forEach(element => {
                if (element.video) element.video = process.env.HOST_URL+element.video.substring(1, element.video.length)
                if (completed && completed.lessons.includes(element._id.toString())) {
                    element.completed = true;
                } else {
                    element.completed = false;
                }
            });
        }
        res.json(course);
    } catch (error) {
        console.log(error)
        return res.status(400).send("Fail to load course");
    }
}

export const markCompleted = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.body;
        const existing = await Completed.findOne({
            user: req.user._id,
            course: courseId
        }).exec();

        if(existing) {
            await Completed.findOneAndUpdate(
                {
                    user: req.user._id,
                    course: courseId
                },
                {
                    $addToSet: {lessons: lessonId}
                }
            ).exec();
        } else {
            await new Completed({
                user: req.user._id,
                course: courseId,
                lessons: lessonId
            }).save();
        }
        next();
    } catch (error) {
        return res.status(400);
    }
}

export const markIncomplete = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.body;
        await Completed.findOneAndUpdate(
            {
                user: req.user._id,
                course: courseId
            },
            {
                $pull: {lessons: lessonId}
            }
        ).exec();
        next();    
    } catch (error) {
        return res.status(400);
    }
}
