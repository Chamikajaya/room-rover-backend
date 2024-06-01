import {Router} from "express";
import {searchHotels} from "../controllers/hotelsController";


const hotelsRouter = Router();


hotelsRouter.get("/search", searchHotels);


export default hotelsRouter;