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
exports.confirmBooking = exports.createPaymentIntent = exports.getSingleHotel = exports.getAllHotels = exports.searchHotels = void 0;
const client_1 = require("@prisma/client");
const buildTheQuery_1 = require("../utils/buildTheQuery");
const hotelValidation_1 = require("../validations/hotelValidation");
const validate_1 = require("../middleware/validate");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const prisma = new client_1.PrismaClient();
const searchHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> GET /api/v1/hotels/search");
    try {
        // Extract and parse pagination parameters
        const currPage = Number(req.query.page) || 1;
        const itemsPerPage = Number(req.query.itemsPerPage) || 4;
        const skip = (currPage - 1) * itemsPerPage;
        // Construct the search query
        const searchQuery = (0, buildTheQuery_1.buildTheQuery)(req.query);
        // extracting the sort parameter
        const sortBy = req.query.sortBy;
        let orderBy = {};
        if (sortBy === "starRatingDesc") {
            orderBy = { starRating: "desc" };
        }
        else if (sortBy === "pricePerNightAsc") {
            orderBy = { pricePerNight: "asc" };
        }
        else if (sortBy === "pricePerNightDesc") {
            orderBy = { pricePerNight: "desc" };
        }
        // Get the total count of hotels matching the search query
        const totalHotels = yield prisma.hotel.count({
            where: searchQuery
        });
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalHotels / itemsPerPage);
        // Find hotels based on the search query with pagination
        const hotelsFound = yield prisma.hotel.findMany({
            where: searchQuery,
            orderBy: orderBy,
            skip,
            take: itemsPerPage, // Take is the number of items to be returned (limit)
        });
        // Construct the response
        const response = {
            hotelsFound,
            paginationInfo: {
                totalHotels,
                totalPages,
                currPage
            }
        };
        // Send the response
        res.status(200).json(response);
    }
    catch (e) {
        console.log("ERROR - SEARCH HOTEL @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.searchHotels = searchHotels;
const getAllHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> GET /api/v1/hotels");
    try {
        const currPage = Number(req.query.page) || 1;
        const itemsPerPage = 5;
        const skip = (currPage - 1) * itemsPerPage;
        const totalHotels = yield prisma.hotel.count({});
        const totalPages = Math.ceil(totalHotels / itemsPerPage);
        const hotels = yield prisma.hotel.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: itemsPerPage
        });
        const response = {
            hotelsFound: hotels,
            paginationInfo: {
                totalHotels,
                totalPages,
                currPage
            }
        };
        // Send the response
        res.status(200).json(response);
    }
    catch (e) {
        console.log("ERROR - GET ALL HOTELS @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.getAllHotels = getAllHotels;
exports.getSingleHotel = [
    hotelValidation_1.getHotelByIdValidationRules,
    validate_1.handleValidationErrors,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Route hit --> GET /api/v1/hotels/:id");
        try {
            const hotelId = req.params.id;
            const hotel = yield prisma.hotel.findUnique({
                where: {
                    id: hotelId
                }
            });
            if (!hotel) {
                return res.status(404).json({ errorMessage: "Hotel not found" });
            }
            res.status(200).json(hotel);
        }
        catch (e) {
            console.log("ERROR - GET SINGLE HOTEL @GET --> " + e);
            res.status(500).json({ errorMessage: "Internal Server Error" });
        }
    })
];
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> POST /api/v1/hotels/:id/bookings/payment-intent");
    try {
        // extracting userId from the request (added by cookie validation middleware)
        const userId = req.userId;
        // extracting hotelId from the params
        const hotelId = req.params.id;
        // extracting nights from the request body
        const { nights } = req.body;
        const hotel = yield prisma.hotel.findUnique({
            where: {
                id: hotelId
            }
        });
        if (!hotel) {
            return res.status(404).json({ errorMessage: "Hotel not found" });
        }
        // * calculating the total amount to be paid in the server side rather than the client side because ->
        // Integrity - By performing calculations on the server-side, we ensure that the data is consistent and accurate. This is because the server environment is controlled and less prone to manipulation compared to the client-side.
        const totalAmount = hotel.pricePerNight * nights;
        //  creating a payment intent (A payment intent represents an attempt to collect payment from a customer)
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            metadata: {
                userId: userId,
                hotelId: hotelId,
            }
        });
        // * The client_secret is a unique key generated by Stripe for each payment intent. It's used on the client-side to confirm the payment. If it doesn't exist, it means that the payment intent creation failed for some reason
        if (!paymentIntent.client_secret) {
            return res.status(500).json({ errorMessage: "Could not create payment intent" });
        }
        const response = {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret.toString(),
            totalAmount // sending the most UPDATED total amount to be paid to the client
        };
        res.status(200).json(response);
    }
    catch (e) {
        console.log("ERROR - DO PAYMENT @POST --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.createPaymentIntent = createPaymentIntent;
const confirmBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> POST /api/v1/hotels/:id/bookings");
    try {
        // checking whether the paymentIntentId is present in the request body
        const { paymentIntentId } = req.body;
        const { checkIn, checkOut, numAdults, numChildren, totalPrice, firstName, lastName, email } = req.body;
        // getting the invoice for the booking
        const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
        if (!paymentIntent) {
            return res.status(400).json({ errorMessage: "Payment intent not found. Null or Invalid payment intent ID" });
        }
        // checking whether the userId in the metadata of the paymentIntent is the same as the userId extracted from the cookie
        // security measure to ensure that the user who initiated the payment earlier,  is the same user who is trying to confirm the booking now
        if (paymentIntent.metadata.userId !== req.userId) {
            return res.status(403).json({ errorMessage: "Payment Intent mismatch with the given info" });
        }
        // checking whether the hotelId in the metadata of the paymentIntent is the same as the hotelId extracted from the params
        // to ensure that the booking is being done for the same hotel for which the payment was made
        if (paymentIntent.metadata.hotelId !== req.params.id) {
            return res.status(400).json({ errorMessage: "Payment Intent mismatch with the given info" });
        }
        // before doing the booking , checking whether the payment has been successful
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                errorMessage: "Payment not successful",
                errCode: paymentIntent.status
            });
        }
        // ! TODO: CAREFUL WHEN SENDING THE REQUEST FROM CLIENT -INCLUDE ALL NECESSARY FIELDS
        // adding the booking to the database
        const booking = yield prisma.booking.create({
            data: {
                userId: req.userId,
                hotelId: req.params.id,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                numAdults,
                numChildren,
                totalPrice,
                email,
                firstName,
                lastName
            },
        });
        res.status(200).json(booking);
    }
    catch (e) {
        console.log("ERROR - CONFIRM BOOKING & DO PAYMENT @POST --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.confirmBooking = confirmBooking;
