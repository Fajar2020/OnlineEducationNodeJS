import jwt from "jsonwebtoken";
import { nanoid } from 'nanoid';

import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import { sendEmailToUser } from "../utils/email";


export const register = async (req,res) => {
    try {
        const { name, email, password } = req.body;
        
        // some validation
        if(!name) return res.status(400).send("Name is required");
        if(!password || password.length < 6) return res.status(400).send("Password is required with minumum 6 characters");

        let userExist = await User.findOne({email}).exec();
        if(!email || userExist) return res.status(400).send("Email is supposed to be unique and required");

        // hash password
        const hashedPassword = await hashPassword(password);

        const user = new User({name, email, password:hashedPassword});
        await user.save();
        // console.log("saved user ",user);

        return res.status(200).json({msg: "user is registered successfully"});
    } catch (error) {
        // console.log(error);
        return res.status(400).send("Error.. please try again");
    }

}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        
        //check user
        const user = await User.findOne({email}).exec();

        if(!user) res.status(400).send("No account with that email")

        // check password match
        const match = await comparePassword(password, user.password);

        if(!match) res.status(400).send("Not match password")

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

        // exlude password to be send
        user.password=undefined;

        //send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            // secure: true // for https
        });

        res.json(user);

    } catch (err) {
        console.log(err);
        res.status(400).send("Error try again");
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.json({msg: "Signout successfully"})
    } catch (err) {
        console.log(err);
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const shortCode = nanoid(6).toUpperCase();
        const user = await User.findOneAndUpdate({email}, {passwordResetCode: shortCode});

        if (!user) {
            return res.status(400).send("User not found");
        }

        await sendEmailToUser(user.email, 'Reset Password', `
        <html>
            <head></head>
            <body>
                <h3>Reset Password</h3>
                <p>Password Reset Code : <b>${shortCode}</b> </p>
                <i>www.courseonlinetesting.com</i>
            </body>
        </html>
        `)

        return res.json({ok:true});
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error try again");
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, code, resetPassword } = req.body;
        const hashedPassword = await hashPassword(resetPassword);
        const user = await User.findOneAndUpdate({
            email,
            passwordResetCode: code
        }, {
            password: hashedPassword,
            passwordResetCode: ''
        })
        
        if (!user) {
            return res.status(400).send("User not found")
        }

        return res.json({ok:true});
    } catch (err) {
        console.log(err);
        return res.status(400).send("Error try again");
    }
}

export const currentUser = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password").exec();
        // console.log("current user ", user);
        if( !user) res.status(401);
        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.send(400);
    }
}
