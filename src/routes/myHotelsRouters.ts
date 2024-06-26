import express from 'express';
import {
    createHotel,
    upload,
    getAllMyHotels,
    deleteHotel,
    updateHotel,
    getHotelById
} from "../controllers/myHotelController";
import {validateCookie} from "../middleware/validateCookie";


const myHotelsRouter = express.Router();


// The validateCookie middleware checks if the request contains a valid JWT token in the cookies. (so that only authenticated users can create hotels)
// The upload middleware is used to upload images to the server. (cloudinary)
// Finally The createHotel controller function creates a hotel in the database.
myHotelsRouter.post("/", validateCookie, upload.array("imageFiles", 5), ...createHotel);
myHotelsRouter.put("/:id", validateCookie, upload.array("imageFiles", 5), updateHotel);

myHotelsRouter.get("/:hotelId", validateCookie, getHotelById);
myHotelsRouter.get("/", validateCookie, getAllMyHotels)

myHotelsRouter.delete("/:hotelId", validateCookie, deleteHotel);


export default myHotelsRouter;