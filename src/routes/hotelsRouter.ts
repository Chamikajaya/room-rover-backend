import {Router} from "express";
import {getSingleHotel, searchHotels} from "../controllers/hotelsController";


const hotelsRouter = Router();


hotelsRouter.get("/search", searchHotels);
hotelsRouter.get("/:id", ...getSingleHotel)


export default hotelsRouter;