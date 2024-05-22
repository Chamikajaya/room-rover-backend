import express from "express";
import {register} from "../controllers/authController";



const userRouter = express.Router();

userRouter.post('/register', register);

export default userRouter;