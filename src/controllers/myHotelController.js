"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHotel = exports.updateHotel = exports.createHotel = exports.getHotelById = exports.getAllMyHotels = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const uploadImagesToCloudinary_1 = require("../utils/uploadImagesToCloudinary");
const hotelValidation_1 = require("../validations/hotelValidation");
const validate_1 = require("../middleware/validate");
const createEmbeddingForHotel_1 = require("../utils/createEmbeddingForHotel");
const pinecone_1 = require("../utils/pinecone");
const prisma = new client_1.PrismaClient();
// configuring multer
const storage = multer_1.default.memoryStorage();
// Set up multer middleware with a file size limit of 5MB
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 mb
    },
});
const getAllMyHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> GET /api/v1/my-hotels");
    try {
        const userId = req.userId;
        const hotels = yield prisma.hotel.findMany({
            where: {
                userId: userId
            }
        });
        res.status(200).json(hotels);
    }
    catch (e) {
        console.log("ERROR - GET ALL MY HOTELS @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.getAllMyHotels = getAllMyHotels;
const getHotelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> GET /api/v1/my-hotels/:id");
    try {
        const hotelId = req.params.hotelId;
        const hotel = yield prisma.hotel.findUnique({
            where: {
                id: hotelId,
                userId: req.userId // we need to make sure that the hotel belongs to the user who is requesting it. 😈
            }
        });
        if (!hotel) {
            res.status(404).json({ errorMessage: "Hotel not found" });
            return;
        }
        res.status(200).json(hotel);
    }
    catch (e) {
        console.log("ERROR - GET HOTEL BY ID @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.getHotelById = getHotelById;
exports.createHotel = [
    hotelValidation_1.hotelCreationValidationRules,
    validate_1.handleValidationErrors,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Route  hit --> POST /api/v1/my-hotels");
        try {
            // Get the uploaded images from the request
            const imageFiles = req.files;
            const hotel = req.body;
            // Uploading the images to cloudinary
            // if the image upload succeeds, the image URLs are stored in the imageURLs field of the hotel object. ->
            hotel.imageURLs = yield (0, uploadImagesToCloudinary_1.uploadImages)(imageFiles);
            // *  whenever the browser sends a request, it sends the token in the headers. According to the workflow set the token is validated and the user ID is set in the request object. (because we run our validateCookie middleware before this controller function) refer to the myHotelsRouter.ts file.
            hotel.userId = req.userId;
            hotel.updatedAt = new Date();
            hotel.pricePerNight = Number(hotel.pricePerNight);
            hotel.starRating = Number(hotel.starRating);
            hotel.numAdults = Number(hotel.numAdults);
            hotel.numChildren = Number(hotel.numChildren);
            // creating the embedding for the hotel
            const hotelEmbedding = yield (0, createEmbeddingForHotel_1.createEmbeddingForHotel)(hotel.id, hotel.name, hotel.description);
            // storing the hotel in MongoDb and embedding in Pinecone in a transaction
            const createdHotel = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // creating the hotel in MongoDb
                const createdHotel = yield tx.hotel.create({
                    data: hotel,
                });
                // storing the embedding in Pinecone
                yield pinecone_1.hotelIndex.upsert([
                    {
                        id: createdHotel.id.toString(),
                        values: hotelEmbedding,
                        // metadata: {userId: createdHotel.userId},
                    },
                ]);
                return createdHotel;
            }));
            res.status(201).json(createdHotel);
        }
        catch (e) {
            console.log("ERROR - CREATE HOTEL @POST --> " + e);
            res.status(500).json({ errorMessage: "Internal Server Error" });
        }
    }),
];
const updateHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> PUT /api/v1/my-hotels/:id");
    try {
        const id = req.params.id;
        const userId = req.userId;
        const _a = req.body, { hotelId, imageUrls } = _a, hotelData = __rest(_a, ["hotelId", "imageUrls"]);
        // Parse numeric fields
        hotelData.pricePerNight = parseFloat(hotelData.pricePerNight);
        hotelData.starRating = parseFloat(hotelData.starRating);
        hotelData.numAdults = parseInt(hotelData.numAdults);
        hotelData.numChildren = parseInt(hotelData.numChildren);
        // creating the embedding for the hotel
        const hotelEmbedding = yield (0, createEmbeddingForHotel_1.createEmbeddingForHotel)(hotelData.id, hotelData.name, hotelData.description);
        const updatedHotelFromDb = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update hotel data
            const updatedHotelFromDb = yield tx.hotel.update({
                where: {
                    id,
                    userId,
                },
                data: Object.assign(Object.assign({}, hotelData), { updatedAt: new Date() }),
            });
            // Update the embedding in Pinecone
            yield pinecone_1.hotelIndex.upsert([
                {
                    id: updatedHotelFromDb.id.toString(),
                    values: hotelEmbedding,
                    // metadata: {userId: updatedHotelFromDb.userId},
                },
            ]);
            return updatedHotelFromDb;
        }));
        if (!updatedHotelFromDb) {
            res.status(404).json({ errorMessage: "Hotel not found" });
            return;
        }
        // Handle image updates
        const imageFiles = req.files;
        const updatedUrls = yield (0, uploadImagesToCloudinary_1.uploadImages)(imageFiles);
        const alreadyUploadedUrls = updatedHotelFromDb.imageURLs || [];
        const mergedImageUrls = [...alreadyUploadedUrls, ...updatedUrls];
        // Update imageURLs in the database
        const updatedHotel = yield prisma.hotel.update({
            where: {
                id,
                userId,
            },
            data: {
                imageURLs: mergedImageUrls,
            },
        });
        res.status(200).json(updatedHotel);
    }
    catch (e) {
        console.log("ERROR - UPDATE HOTEL @PUT --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.updateHotel = updateHotel;
const deleteHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> DELETE /api/v1/my-hotels/:id");
    try {
        const id = req.params.hotelId;
        const userId = req.userId;
        // Verify that the hotel belongs to the user
        const hotel = yield prisma.hotel.findUnique({
            where: {
                id,
                userId,
            },
        });
        if (!hotel) {
            res.status(404).json({ errorMessage: "Hotel not found" });
            return;
        }
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete the hotel
            yield prisma.hotel.delete({
                where: {
                    id,
                },
            });
            yield pinecone_1.hotelIndex.deleteOne(id.toString());
        }));
        res.status(200).json({ message: "Hotel deleted successfully" });
    }
    catch (e) {
        console.log("ERROR - DELETE HOTEL @DELETE --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.deleteHotel = deleteHotel;
