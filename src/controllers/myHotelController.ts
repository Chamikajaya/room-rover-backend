import multer from "multer";
import {Hotel, PrismaClient} from "@prisma/client";
import {Request, Response} from "express";
import {uploadImages} from "../utils/uploadImagesToCloudinary";
import {hotelCreationValidationRules} from "../validations/hotelValidation";
import {handleValidationErrors} from "../middleware/validate";
import {createEmbeddingForHotel} from "../utils/botRelatedUtils/createEmbeddingForHotel";
import {hotelIndex} from "../utils/botRelatedUtils/pinecone";

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

export const getAllMyHotels = async (req: Request, res: Response) => {

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


};

export const getHotelById = async (req: Request, res: Response) => {

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

};

export const createHotel = [
    hotelCreationValidationRules,
    handleValidationErrors,
    async (req: Request, res: Response) => {
        console.log("Route  hit --> POST /api/v1/my-hotels");
        try {
            // Get the uploaded images from the request
            const imageFiles = req.files as Express.Multer.File[];

            const hotel: Hotel = req.body;

            // Uploading the images to cloudinary
            // if the image upload succeeds, the image URLs are stored in the imageURLs field of the hotel object. ->
            hotel.imageURLs = await uploadImages(imageFiles);

            // *  whenever the browser sends a request, it sends the token in the headers. According to the workflow set the token is validated and the user ID is set in the request object. (because we run our validateCookie middleware before this controller function) refer to the myHotelsRouter.ts file.

            hotel.userId = req.userId as string;

            hotel.updatedAt = new Date();

            hotel.pricePerNight = Number(hotel.pricePerNight);

            hotel.starRating = Number(hotel.starRating);


            hotel.numAdults = Number(hotel.numAdults);
            hotel.numChildren = Number(hotel.numChildren);

            // creating the embedding for the hotel
            const hotelEmbedding = await createEmbeddingForHotel(hotel.id, hotel.name, hotel.description);

            // storing the hotel in MongoDb and embedding in Pinecone in a transaction
            const createdHotel = await prisma.$transaction(async (tx) => {
                // creating the hotel in MongoDb
                const createdHotel = await tx.hotel.create({
                    data: hotel,
                });
                // storing the embedding in Pinecone
                await hotelIndex.upsert([
                    {
                        id: createdHotel.id.toString(),
                        values: hotelEmbedding,
                        // metadata: {userId: createdHotel.userId},
                    },

                ]);
                return createdHotel;

            })

            res.status(201).json(createdHotel);
        } catch (e) {
            console.log("ERROR - CREATE HOTEL @POST --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    },
];

export const updateHotel = async (req: Request, res: Response) => {
    console.log("Route hit --> PUT /api/v1/my-hotels/:id");


    try {
        const id = req.params.id as string;
        const userId = req.userId as string;
        const {hotelId, imageUrls, ...hotelData} = req.body;

        // Parse numeric fields
        hotelData.pricePerNight = parseFloat(hotelData.pricePerNight);
        hotelData.starRating = parseFloat(hotelData.starRating);
        hotelData.numAdults = parseInt(hotelData.numAdults);
        hotelData.numChildren = parseInt(hotelData.numChildren);

        // creating the embedding for the hotel
        const hotelEmbedding = await createEmbeddingForHotel(hotelData.id, hotelData.name, hotelData.description);

        const updatedHotelFromDb = await prisma.$transaction(async (tx) => {
            // Update hotel data
            const updatedHotelFromDb = await tx.hotel.update({
                where: {
                    id,
                    userId,
                },
                data: {
                    ...hotelData,
                    updatedAt: new Date(),
                },
            });

            // Update the embedding in Pinecone
            await hotelIndex.upsert([
                {
                    id: updatedHotelFromDb.id.toString(),
                    values: hotelEmbedding,
                    // metadata: {userId: updatedHotelFromDb.userId},
                },
            ]);

            return updatedHotelFromDb;
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


export const deleteHotel = async (req: Request, res: Response) => {

    console.log("Route hit --> DELETE /api/v1/my-hotels/:id");

    try {


        const id = req.params.hotelId as string;
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


        await prisma.$transaction(async (tx) => {
            // Delete the hotel
            await prisma.hotel.delete({
                where: {
                    id,
                },
            });

            await hotelIndex.deleteOne(id.toString());

        });


        res.status(200).json({message: "Hotel deleted successfully"});
    } catch (e) {
        console.log("ERROR - DELETE HOTEL @DELETE --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }

}


