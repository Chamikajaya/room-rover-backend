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
import {uploadImages} from "./utils/uploadImagesToCloudinary";
import {upload} from "./controllers/myHotelController";
import {hotelCreationValidationRules} from "./validations/hotelValidation";
import {handleValidationErrors} from "./middleware/validate";
import hotelsRouter from "./routes/hotelsRouter";


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

app.use('/api/v1/hotels', hotelsRouter);
app.use('/api/v1/my-hotels', myHotelsRouter);
app.use('/api/v1/users', userRouter);


// ! TODO: Refactor once that bug is fixed --> 👇👇👇👇👇👇👇

app.get("/api/v1/my-hotels/:hotelId", validateCookie, async (req: Request, res: Response) => {
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

app.get("/api/v1/my-hotels", validateCookie, async (req: Request, res: Response) => {

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


app.put("/api/v1/my-hotels/:id", validateCookie, upload.array("imageFiles", 5), ...[
    hotelCreationValidationRules,
    handleValidationErrors,
    async (req: Request, res: Response) => {
        console.log("Route hit --> PUT /api/v1/my-hotels/:id");


        try {
            const id = req.params.id as string;
            const userId = req.userId as string;
            const {hotelId, imageUrls, ...hotelData} = req.body;

            // Parse numeric fields
            hotelData.pricePerNight = parseFloat(hotelData.pricePerNight);
            hotelData.starRating = parseFloat(hotelData.starRating);

            // Update hotel data
            const updatedHotelFromDb = await prisma.hotel.update({
                where: {
                    id,
                    userId,
                },
                data: {
                    ...hotelData,
                    updatedAt: new Date(),
                },
            });

            if (!updatedHotelFromDb) {
                res.status(404).json({errorMessage: "Hotel not found"});
                return;
            }

            // Handle image updates
            const imageFiles = req.files as Express.Multer.File[];
            const updatedUrls = await uploadImages(imageFiles);
            const alreadyUploadedUrls = updatedHotelFromDb.imageURLs || [];
            const mergedImageUrls = [...alreadyUploadedUrls, ...updatedUrls];

            // Update imageURLs in the database
            const updatedHotel = await prisma.hotel.update({
                where: {
                    id,
                    userId,
                },
                data: {
                    imageURLs: mergedImageUrls,
                },
            });

            res.status(200).json(updatedHotel);

        } catch (e) {
            console.log("ERROR - UPDATE HOTEL @PUT --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    }
]);

app.delete("/api/v1/my-hotels/:id", validateCookie, async (req: Request, res: Response) => {
    console.log("Route hit --> DELETE /api/v1/my-hotels/:id");

    try {
        const id = req.params.id as string;
        const userId = req.userId as string;

        // Verify that the hotel belongs to the user
        const hotel = await prisma.hotel.findUnique({
            where: {
                id,
                userId,
            },
        });

        if (!hotel) {
            res.status(404).json({errorMessage: "Hotel not found"});
            return;
        }

        // Delete the hotel
        await prisma.hotel.delete({
            where: {
                id,
            },
        });

        res.status(200).json({message: "Hotel deleted successfully"});
    } catch (e) {
        console.log("ERROR - DELETE HOTEL @DELETE --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
