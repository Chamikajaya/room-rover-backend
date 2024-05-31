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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotel = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const uploadImagesToCloudinary_1 = require("../utils/uploadImagesToCloudinary");
const hotelValidation_1 = require("../validations/hotelValidation");
const validate_1 = require("../middleware/validate");
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
exports.createHotel = [
    hotelValidation_1.hotelCreationValidationRules,
    validate_1.handleValidationErrors,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Route hit 😊 --> POST /api/v1/my-hotels");
        try {
            // Get the uploaded images from the request
            const imageFiles = req.files;
            const hotel = req.body;
            console.log("Hotel is --> " + JSON.stringify(hotel));
            // Uploading the images to cloudinary
            // if the image upload succeeds, the image URLs are stored in the imageURLs field of the hotel object. ->
            hotel.imageURLs = yield (0, uploadImagesToCloudinary_1.uploadImages)(imageFiles);
            // *  whenever the browser sends a request, it sends the token in the headers. According to the workflow set the token is validated and the user ID is set in the request object. (because we run our validateCookie middleware before this controller function) refer to the myHotelsRouter.ts file.
            hotel.userId = req.userId;
            hotel.updatedAt = new Date();
            hotel.pricePerNight = Number(hotel.pricePerNight);
            hotel.starRating = Number(hotel.starRating);
            // creating the hotel
            const createdHotel = yield prisma.hotel.create({
                data: hotel,
            });
            res.status(201).json(createdHotel);
        }
        catch (e) {
            console.log("ERROR - CREATE HOTEL @POST --> " + e);
            res.status(500).json({ errorMessage: "Internal Server Error" });
        }
    })
];
