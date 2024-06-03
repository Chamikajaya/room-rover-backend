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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleHotel = exports.searchHotels = void 0;
const client_1 = require("@prisma/client");
const buildTheQuery_1 = require("../utils/buildTheQuery");
const hotelValidation_1 = require("../validations/hotelValidation");
const validate_1 = require("../middleware/validate");
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
