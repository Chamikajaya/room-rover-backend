"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.verifyEmail = exports.register = exports.sendUserIdUponTokenValidation = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authValidation_1 = require("../validations/authValidation");
const validate_1 = require("../middleware/validate");
const uuid_1 = require("uuid");
const sendVerificationEmail_1 = require("../utils/sendVerificationEmail");
const prisma = new client_1.PrismaClient();
// generating the jwt token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
const setCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // set to true in production
        maxAge: 1000 * 60 * 60 * 24, // 1 day in ms -> After this time, the cookie will expire, and the user will need to authenticate again.
    });
};
// sends the user ID back to the frontend in the response.
const sendUserIdUponTokenValidation = (req, res) => {
    return res.status(200).json({ userId: req.userId });
};
exports.sendUserIdUponTokenValidation = sendUserIdUponTokenValidation;
exports.register = [
    authValidation_1.registerValidationRules,
    validate_1.handleValidationErrors,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, firstName, lastName } = req.body;
            // check whether the user already exists
            const existingUser = yield prisma.user.findFirst({
                where: { email }
            });
            if (existingUser) {
                return res.status(400).json({ errorMessage: "Email already exists." });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName
                }
            });
            // check whether a token already exists
            const emailVerificationTokenExists = yield prisma.userVerification.findFirst({
                where: { userId: user.id }
            });
            // if so remove it from db
            if (emailVerificationTokenExists) {
                yield prisma.userVerification.delete({
                    where: { id: emailVerificationTokenExists.id }
                });
            }
            // generate email verification token
            const emailVerificationToken = (0, uuid_1.v4)();
            const emailVerificationTokenExpiresAt = new Date(Date.now() + 60 * 15 * 1000); // 15 minutes
            yield prisma.userVerification.create({
                data: {
                    verificationToken: emailVerificationToken,
                    expiresAt: emailVerificationTokenExpiresAt,
                    userId: user.id
                }
            });
            yield (0, sendVerificationEmail_1.sendVerificationEmail)(email, emailVerificationToken);
            // generate the token
            const token = generateToken(user.id);
            return res.status(201).json({ successMessage: "Registered successfully. Please check your email to verify your account." });
            /*
           // after generating the JWT token, it is being set as a cookie in the response using the res.cookie method provided by Express.


           // setCookie(res, token);

           // return res.status(201).json({successMessage: "Registered successfully"});
           */
        }
        catch (e) {
            console.log("ERROR - REGISTER @POST --> " + e);
            res.status(500).json({ errorMessage: "Internal Server Error" });
        }
    })
];
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    console.log(token);
    if (!token) {
        console.log("Token not found");
        return res.status(400).json({ errorMessage: "Missing token" });
    }
    console.log("Token found: " + token);
    try {
        // If the token is provided, it tries to find a UserVerification instance in the database that has the same verificationToken as the provided token.
        const emailVerificationToken = yield prisma.userVerification.findFirst({
            where: { verificationToken: token }
        });
        if (!emailVerificationToken || emailVerificationToken.expiresAt < new Date()) {
            return res.status(400).json({ errorMessage: "Invalid or expired token" });
        }
        yield prisma.userVerification.delete({
            where: { id: emailVerificationToken.id }
        });
        // setting the emailVerified field to true. This means that the user's email has been verified.
        const verifiedUser = yield prisma.user.update({
            where: { id: emailVerificationToken.userId },
            data: {
                emailVerified: true
            }
        });
        // Generate a JWT token and set it as a cookie upon successful email verification.
        const jwtToken = generateToken(verifiedUser.id);
        setCookie(res, jwtToken);
        return res.status(200).json({ successMessage: "Email verified successfully" });
    }
    catch (e) {
        console.log("ERROR - VERIFY EMAIL @GET --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.verifyEmail = verifyEmail;
exports.login = [
    authValidation_1.loginValidationRules,
    validate_1.handleValidationErrors,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const userExists = yield prisma.user.findFirst({
                where: { email }
            });
            if (!userExists) {
                return res.status(400).json({ errorMessage: "Invalid credentials" });
            }
            // check whether the password matches
            const passwordMatch = yield bcryptjs_1.default.compare(password, userExists.password);
            if (!passwordMatch) {
                return res.status(400).json({ errorMessage: "Invalid credentials" });
            }
            // generate the token
            const token = generateToken(userExists.id);
            // set the token as a cookie
            setCookie(res, token);
            return res.status(200).json({ userId: userExists.id });
        }
        catch (e) {
            console.log("ERROR - LOGIN @POST --> " + e);
            res.status(500).json({ errorMessage: "Internal Server Error" });
        }
    })
];
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token");
        return res.status(200).json({ successMessage: "Logged out successfully" });
    }
    catch (e) {
        console.log("ERROR - LOGOUT @POST --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.logout = logout;
