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
exports.getMyBookings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> GET /api/v1/my-bookings");
    try {
        const userId = req.userId;
        const bookings = yield prisma.booking.findMany({
            where: {
                userId
            },
            include: {
                Hotel: {
                    select: {
                        name: true
                    }
                }
            }
        });
        // Transform the response to include the hotel name directly in the booking object
        const bookingsWithHotelName = bookings.map(booking => (Object.assign(Object.assign({}, booking), { hotelName: booking.Hotel.name })));
        console.log("Bookings --> ", bookingsWithHotelName);
        res.status(200).json(bookingsWithHotelName);
    }
    catch (e) {
        console.log("ERROR - MY BOOKINGS @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.getMyBookings = getMyBookings;
