import express from 'express';  //this can happen because of esm package
import cors from 'cors';
import {readdirSync} from 'fs';
import mongoose from 'mongoose';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
// import expressJwt from 'express-jwt';

const morgan = require("morgan");
require('dotenv').config();

const csrfProtection = csrf({cookie: true});

// start app with express
const app = express();


//db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
    // useCreateIndex: true
}).then(()=> console.log("DB connected"))
.catch((err)=>console.log("DB ERROR => ", err));

// apply middleware
app.use(cors());
app.use(express.json({limit: "5mb"}));
// limit need to be defined or they will only accept small size request
app.use(morgan("dev"));

// csrf
app.use(cookieParser())
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res)=>{
    res.json({csrfToken: req.csrfToken()});
});

// if we want to add validation for user who access
// const requireSignin = expressJwt({
//     getToken: (req, res) => req.cookies.token,
//     secret: process.env.JWT_SECRET,
//     algorithms: ["HS256"]
// });
// const checkUserCourseAvailable = async (req, res, next) => {
//     console.log('in checkUserCourseAvailable')
//     next();
// }
// app.use('/upload', requireSignin, checkUserCourseAvailable, express.static(process.cwd() + '/upload'))

// as long as we know the file url then we can access
app.use('/upload', express.static(process.cwd() + '/upload'))

// call the route
readdirSync('./routes').map( (r) => {
    app.use(`/api/${r.substring(0, r.length - 3)}`, require(`./routes/${r}`))
});


const port = process.env.PORT || 8000;

app.listen(port, ()=> console.log(`Server is running in port ${port}`));