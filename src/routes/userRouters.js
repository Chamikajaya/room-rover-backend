"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validateCookie_1 = require("../middleware/validateCookie");
const userRouter = express_1.default.Router();
userRouter.post('/register', ...authController_1.register); // make sure to spread the array otherwise it will be treated as a single argument 💣
userRouter.post('/verify-email', authController_1.verifyEmail);
userRouter.post('/login', ...authController_1.login);
userRouter.get("/validate-token", validateCookie_1.validateCookie, authController_1.sendUserIdUponTokenValidation);
userRouter.post("/logout", authController_1.logout);
userRouter.post("request-password-reset", authController_1.requestPasswordReset);
userRouter.post("reset-password", authController_1.resetPassword);
userRouter.get("/me", validateCookie_1.validateCookie, authController_1.getUser);
exports.default = userRouter;
