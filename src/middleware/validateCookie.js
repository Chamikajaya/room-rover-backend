"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCookie = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// The validateCookie middleware checks if the request contains a valid JWT token in the cookies.
const validateCookie = (req, res, next) => {
    console.log("Route hit --> validateCookie.ts");
    // check if the token exists
    const token = req.cookies.token;
    // if the token does not exist, then the user is not authenticated
    if (!token) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    try {
        // console.log("Inside try block")
        // verify the token -- This is vital because the token could be tampered with or expired
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // get the userId from the decoded token (this is possible because we added the userId to the token when we generated it 😊)
        // If the token is valid, the user ID is extracted from the token and attached to the request object.
        req.userId = decoded.userId;
        next();
    }
    catch (e) {
        console.log("ERROR - VALIDATE COOKIE --> " + e);
        return res.status(401).json({ errorMessage: "Unauthorized" });
    }
};
exports.validateCookie = validateCookie;
