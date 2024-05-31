import express from "express";
import {createHotel, getAllMyHotels, upload} from "../controllers/myHotelController";
import {validateCookie} from "../middleware/validateCookie";

const myHotelsRouter = express.Router();


// The validateCookie middleware checks if the request contains a valid JWT token in the cookies. (so that only authenticated users can create hotels)
// The upload middleware is used to upload images to the server. (cloudinary)
// Finally The createHotel controller function creates a hotel in the database.
myHotelsRouter.post("/", validateCookie, upload.array("imageFiles", 5), ...createHotel);

myHotelsRouter.get("/", validateCookie, getAllMyHotels);



export default myHotelsRouter;