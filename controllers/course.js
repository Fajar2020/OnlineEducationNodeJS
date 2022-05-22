import slugify from "slugify";
import fs from "fs";
import Course from "../models/course";



export const create = async (req, res) => {
    try {
        const alreadyExists = await Course.findOne({
            slug: slugify(req.body.name.toLowerCase())
        })

        if (alreadyExists) return res.status(400).send("Title is taken");

        const course = await new Course({
            slug: slugify(req.body.name),
            instructor: req.user._id,
            ...req.body
        }).save();

        res.json(course);
    } catch (error) {
        return res.status(400).send("Fail to create course");
    }
}

export const edit = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { name, description, price, paid, category, image, lessons, saveFromDragDrop } = req.body;

        const course = await Course.findById(courseId).exec();
        let alreadyExists = false;
        if (!course) {
            return res.sendStatus(400)
        } else if (course.instructor != req.user._id) return res.sendStatus(403);

        if (saveFromDragDrop) {
            course.lessons = lessons;
        } else {
            if (course.name !== name ) {
                alreadyExists = await Course.findOne({
                    slug: slugify(req.body.name.toLowerCase())
                })
                course.slug = slugify(req.body.name);
            }
    
            if (alreadyExists) return res.status(400).send("Title is taken");
    
            course.description = description;
            course.price = price;
            course.paid = paid;
            course.category = category;
            course.image = image;
        }
        
        course.save();

        res.json(course);
    } catch (error) {
        return res.status(400).send("Fail to update course");
    }
}

export const read = async (req, res) => {
    try {
        const course = await Course.findOne({slug: req.params.slug}).populate("instructor", "_id name").exec();
        if (course && course.lessons) {
            course.lessons.forEach(element => {
                if (element.video) element.video = process.env.HOST_URL+element.video.substring(1, element.video.length)
            });
        }
        res.json(course);
    } catch (error) {
        return res.sendStatus(400)
    }
}

export const addLesson = async (req, res) => {
    // besok coba habis di matikan laptop ada tidak
    // C:\Users\user\AppData\Local\Temp\upload_6b4a5afd805296e91ebf666caf7542e8
    try {
        const { video } = req.files;
        const { courseId } = req.params;
        const { title, content, free_preview } = req.fields;
        
        const course = await Course.findById(courseId).exec();
        if (!course) {
            return res.sendStatus(400)
        } else if (course.instructor != req.user._id) return res.sendStatus(403);

        let newPath = null;
        if (video) {
            const current = new Date();
            newPath = './upload/video/'+current.getTime()+video.name;
            fs.writeFileSync(newPath, fs.readFileSync(video.path))
        }
        
        course.lessons.push({
            title,
            slug: slugify(title),
            content,
            video: newPath,
            free_preview
        })

        course.save();
        res.json(course);
    } catch (error) {
        return res.sendStatus(400)
    }
}

export const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { courseId } = req.body;
        
        let course = await Course.findById(courseId).exec();
        
        if (!course) {
            return res.sendStatus(400)
        } else if (course.instructor != req.user._id) return res.sendStatus(403);

        let lesson = null;
        const newLessons = [];
        course.lessons.forEach(element => {
            if (element._id == lessonId) {
                lesson = element;
            } else {
                newLessons.push(element);
            }
        });

        if (lesson && lesson.video) {
            fs.unlinkSync(lesson.video)
        }

        course.lessons = newLessons;
        course.save();
        res.sendStatus(200);
    } catch (error) {
        return res.sendStatus(400);
    }
}

export const editLesson = async (req, res) => {
    try {
        const { video } = req.files;
        const { courseId } = req.params;
        const { title, content, free_preview, lessonId } = req.fields;
        let {previousVideo} = req.fields;
        
        if (previousVideo === 'null' || previousVideo === 'undefined') {
            previousVideo = null
        };
        const course = await Course.findById(courseId).exec();
        if (!course) {
            return res.sendStatus(400)
        } else if (course.instructor != req.user._id) return res.sendStatus(403);

        let newPath = null;
        if (previousVideo) {
            previousVideo=previousVideo.replace(process.env.HOST_URL, '.');
            newPath = previousVideo;
        }
        if (video) {
            const current = new Date();
            newPath = './upload/video/'+current.getTime()+video.name;
            fs.writeFileSync(newPath, fs.readFileSync(video.path))
            if (previousVideo) {
                fs.unlinkSync(previousVideo)
            }
        }
        
        const updated = await Course.updateOne(
            {"lessons._id": lessonId},
            {
                $set: {
                    "lessons.$.title": title,
                    "lessons.$.content": content,
                    "lessons.$.video": newPath,
                    "lessons.$.free_preview":free_preview,
                }
            },
            {new:true}
        ).exec();

        res.json(await Course.findById(courseId).exec());
    } catch (error) {
        return res.sendStatus(400)
    }
}
