import {Router} from "express";
import {
    confirmBooking,
    createPaymentIntent, getAllHotels,
    getSingleHotel,
    searchHotels
} from "../controllers/hotelsController";
import {validateCookie} from "../middleware/validateCookie";


const hotelsRouter = Router();


hotelsRouter.get("/search", searchHotels);
hotelsRouter.get("/:id", ...getSingleHotel)
hotelsRouter.get("/", getAllHotels);
hotelsRouter.post("/:id/bookings/payment-intent", validateCookie, createPaymentIntent);
hotelsRouter.post("/:id/bookings", validateCookie, confirmBooking);


export default hotelsRouter;