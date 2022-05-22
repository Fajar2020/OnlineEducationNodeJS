import User from "../models/user";
import queryString from "query-string";
import { v4 as uuidv4 } from 'uuid';
import Course from "../models/course";

// const stripe =  require("stripe")(process.env.STRIPE_SECRET);

export const makeInstructor = async (req, res) => {
    // this route suppose to be bridge for third party
    // for now we skip this part
    try {
        // this part suppose to be connect user to payment gateway
        const user = await User.findById(req.user._id).select("-password").exec();
        if (!user.payment_account_id) {
            user.payment_account_id = uuidv4();
            user.role.push("Instructor");
            user.save();
        }
        res.json(user);
    } catch (err) {
        console.log('make instructor err => ', err);
    }
    // for stripe set up
    // try {
    //     // this part suppose to be connect user to payment gateway
    //     // 1. find user from db
    //     const user = await User.findById(req.user._id).exec();
    //     // 2. no stripe_account_id, then create new --> type: "standard" --> untuk manual transfer
    //     if (!user.stripe_account_id) {
    //         const account = await stripe.accounts.create({
    //             type: "express"
    //         });
    //         user.stripe_account_id = account.id;
    //         user.save();
    //     }
    //     // 3. create account link based on account id for frontend to finish onboarding
    //     let accountLink = await stripe.accountLinks.create({
    //         account: user.stripe_account_id,
    //         refresh_url: process.env.PAYMENT_REDIRECT_URL,
    //         return_url: process.env.PAYMENT_REDIRECT_URL,
    //         type: "account_onboarding"
    //     });
    //     // 4. pre-fill any info such as email (optional), then send url response
    //     accountLink = Object.assign(accountLink, {
    //         "stripe_user[email]": user.email,
    //     });
    //     // 5. then send account link as response to frontend
    //     res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`)
    // } catch (err) {
    //     console.log('make instructor err => ', err);
    // }
};

export const currentInstructor = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).select("-password").exec();
        if (!user.role.includes("Instructor")) {
            return res.sendStatus(403);
        } else {
            res.json({ok: true});
        }
    } catch (err) {
        console.log(err);
    }
};

export const getCourse = async (req, res) => {
    try {
        const courses = await Course.find({
            instructor: req.user._id
        }).sort({createdAt: -1}).exec();
        res.json(courses);
    } catch (error) {
        return res.sendStatus(400);
    }
}