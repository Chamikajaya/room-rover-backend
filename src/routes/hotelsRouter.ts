import {Router} from "express";
import {doPayment, getSingleHotel, searchHotels} from "../controllers/hotelsController";
import {validateCookie} from "../middleware/validateCookie";


const hotelsRouter = Router();


hotelsRouter.get("/search", searchHotels);
hotelsRouter.get("/:id", ...getSingleHotel)
hotelsRouter.post("/:id/bookings/payment-intent", validateCookie, doPayment);


export default hotelsRouter;