import multer from "multer";
import {Hotel, PrismaClient} from "@prisma/client";
import {Request, Response} from "express";
import {v2 as cloudinary} from "cloudinary";
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
        try {

            // Get the uploaded images from the request
            const images = req.files as Express.Multer.File[];

            const hotel: Hotel = req.body;

            // Uploading the images to cloudinary
            const imageUrlsForTheHotel = await Promise.all(images.map(async (image) => {
                const base64 = Buffer.from(image.buffer).toString("base64");
                let dataURI = `data:${image.mimetype};base64,${base64}`;
                const response = await cloudinary.uploader.upload(dataURI);
                return response.url;
            }));

            // if the image upload succeeds, the image URLs are stored in the imageURLs field of the hotel object. ->
            hotel.imageURLs = imageUrlsForTheHotel;

            // *  whenever the browser sends a request, it sends the token in the headers. According to the workflow set the token is validated and the user ID is set in the request object. (because we run our validateCookie middleware before this controller function) refer to the myHotelsRouter.ts file.

            hotel.userId = req.userId as string;

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