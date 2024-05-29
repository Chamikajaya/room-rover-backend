import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter from "./routes/userRouters";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary';
import myHotelsRouter from "./routes/myHotelsRouters";
import {transporter} from "./utils/sendVerificationEmail";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("api secret is " + process.env.CLOUDINARY_API_SECRET);



const app = express();

app.use(cookieParser());  // * so that we can access the cookies in the request object (refer validateCookie.ts)
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// server is going to accept request from client url -->
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


transporter.verify((err, success) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is ready to take messages");
    }
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/my-hotels', myHotelsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

