import express from "express";
import {login, register} from "../controllers/authController";



const userRouter = express.Router();

userRouter.post('/register', ...register);  // make sure to spread the array otherwise it will be treated as a single argument 💣
userRouter.post('/login', ...login);

export default userRouter;