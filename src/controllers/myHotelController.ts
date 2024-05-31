import multer from "multer";
import {Hotel, PrismaClient} from "@prisma/client";
import {Request, Response} from "express";
import {uploadImages} from "../utils/uploadImagesToCloudinary";
import {hotelCreationValidationRules} from "../validations/hotelValidation";
import {handleValidationErrors} from "../middleware/validate";


const prisma = new PrismaClient();

// configuring multer
const storage = multer.memoryStorage();

// Set up multer middleware with a file size limit of 5MB
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 mb
    },
});

export const createHotel = [
    hotelCreationValidationRules,
    handleValidationErrors,
    async (req: Request, res: Response) => {

    console.log("Route hit --> POST /api/v1/my-hotels");
        try {

            // Get the uploaded images from the request
            const imageFiles = req.files as Express.Multer.File[];

            const hotel: Hotel = req.body;

            console.log("Hotel is --> " + JSON.stringify(hotel));

            // Uploading the images to cloudinary
            // if the image upload succeeds, the image URLs are stored in the imageURLs field of the hotel object. ->
            hotel.imageURLs = await uploadImages(imageFiles);

            // *  whenever the browser sends a request, it sends the token in the headers. According to the workflow set the token is validated and the user ID is set in the request object. (because we run our validateCookie middleware before this controller function) refer to the myHotelsRouter.ts file.

            hotel.userId = req.userId as string;

            hotel.updatedAt = new Date();

            hotel.pricePerNight = Number(hotel.pricePerNight);

            hotel.starRating = Number(hotel.starRating);

            // creating the hotel
            const createdHotel = await prisma.hotel.create({
                data: hotel,
            });

            res.status(201).json(createdHotel);


        } catch (e) {
            console.log("ERROR - CREATE HOTEL @POST --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    }
]

// export const getAllMyHotels = async(req: Request, res: Response) => {
//
//     console.log("Route hit --> GET /api/v1/my-hotels");
//
//     try {
//
//         const userId = req.userId as string;
//
//         const hotels = await prisma.hotel.findMany({
//             where: {
//                 userId: userId
//             }
//         });
//
//         res.status(200).json(hotels);
//
//
//     } catch (e) {
//         console.log("ERROR - GET ALL MY HOTELS @GET --> " + e);
//         res.status(500).json({errorMessage: "Internal Server Error"});
//     }
//
//
//
//
//
//
// };


export const getHotelById = async(req: Request, res: Response) => {

    console.log("Route hit --> GET /api/v1/my-hotels/:id");

    try {

        const hotelId = req.params.id;

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

};