import multer from "multer";
import {PrismaClient} from "@prisma/client";
import {Request, Response} from "express";
import {v2 as cloudinary} from "cloudinary";


const prisma = new PrismaClient();

// ? what is this?
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 mb
    },
});

export const createHotel = async (req: Request, res: Response) => {
    try {

        const images = req.files as Express.Multer.File[];
        const newHotel = req.body;

        // Uploading the images to cloudinary
        const imageUrls = await Promise.all(images.map(async (image) => {
            const base64 = Buffer.from(image.buffer).toString("base64");
            let dataURI = `data:${image.mimetype};base64,${base64}`;
            const response = await cloudinary.uploader.upload(dataURI);
            return response.url;
        }));




    } catch (e) {
        console.log("ERROR - CREATE HOTEL @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};