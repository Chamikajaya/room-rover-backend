import express, {Router} from "express";
import {validateCookie} from "../middleware/validateCookie";
import {getMyBookings} from "../controllers/bookingsController";


const bookingsRouter = Router();

bookingsRouter.get("/", validateCookie, getMyBookings)

export default bookingsRouter;