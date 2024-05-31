import 'dotenv/config';
import express, {Request, Response} from 'express';
import cors from 'cors';
import userRouter from "./routes/userRouters";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary';
import myHotelsRouter from "./routes/myHotelsRouters";
import {transporter} from "./utils/sendVerificationEmail";
import {validateCookie} from "./middleware/validateCookie";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


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


app.get("/hello", (req, res) => {
    res.status(200).json({
        "msg": "hello"
    })
})

app.use('/api/v1/my-hotels', myHotelsRouter);
app.use('/api/v1/users', userRouter);

// ! TODO: Refactor once that bug is fixed --> 👇👇👇👇👇👇👇


app.use("/api/v1/my-hotels/:hotelId", validateCookie, async(req: Request, res: Response) => {
    console.log("Route hit --> GET /api/v1/my-hotels/:id");

    try {

        const hotelId = req.params.hotelId;

        const hotel = await prisma.hotel.findUnique({
            where: {
                id: hotelId,
                userId: req.userId as string  // we need to make sure that the hotel belongs to the user who is requesting it. 😈

            }
        });

        if (!hotel) {
            res.status(404).json({errorMessage: "Hotel not found"});
            return;
        }

        res.status(200).json(hotel);



    } catch (e) {
        console.log("ERROR - GET HOTEL BY ID @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
});

app.use("/api/v1/my-hotels", validateCookie, async(req: Request, res: Response) => {

    console.log("Route hit --> GET /api/v1/my-hotels");

    try {

        const userId = req.userId as string;

        const hotels = await prisma.hotel.findMany({
            where: {
                userId: userId
            }
        });

        res.status(200).json(hotels);


    } catch (e) {
        console.log("ERROR - GET ALL MY HOTELS @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }

});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});