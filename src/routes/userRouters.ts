import express from "express";
import {login, logout, register, sendUserIdUponTokenValidation} from "../controllers/authController";
import {validateCookie} from "../middleware/validateCookie";


const userRouter = express.Router();

userRouter.post('/register', ...register);  // make sure to spread the array otherwise it will be treated as a single argument 💣
userRouter.post('/login', ...login);
userRouter.get("/validate-token", validateCookie, sendUserIdUponTokenValidation);
userRouter.post("/logout", logout);

export default userRouter;