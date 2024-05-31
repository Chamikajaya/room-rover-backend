"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const myHotelController_1 = require("../controllers/myHotelController");
const validateCookie_1 = require("../middleware/validateCookie");
const myHotelsRouter = express_1.default.Router();
// The validateCookie middleware checks if the request contains a valid JWT token in the cookies. (so that only authenticated users can create hotels)
// The upload middleware is used to upload images to the server. (cloudinary)
// Finally The createHotel controller function creates a hotel in the database.
myHotelsRouter.post("/", validateCookie_1.validateCookie, myHotelController_1.upload.array("imageFiles", 5), ...myHotelController_1.createHotel);
exports.default = myHotelsRouter;
