import express from "express";
import {createHotel, upload} from "../controllers/myHotelController";

const myHotelsRouter = express.Router();

// ? what is this?
myHotelsRouter.post("/", upload.array("images", 5), createHotel);


export default myHotelsRouter;