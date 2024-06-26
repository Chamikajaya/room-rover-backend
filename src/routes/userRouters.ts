import express from "express";
import {
    getUser,
    login,
    logout,
    register, requestPasswordReset, resetPassword,
    sendUserIdUponTokenValidation,
    verifyEmail
} from "../controllers/authController";
import {validateCookie} from "../middleware/validateCookie";


const userRouter = express.Router();

userRouter.post('/register', ...register);  // make sure to spread the array otherwise it will be treated as a single argument 💣
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/login', ...login);
userRouter.get("/validate-token", validateCookie, sendUserIdUponTokenValidation);
userRouter.post("/logout", logout);
userRouter.post("/request-password-reset", requestPasswordReset);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/me", validateCookie, getUser);

export default userRouter;