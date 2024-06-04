"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouters_1 = __importDefault(require("./routes/userRouters"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cloudinary_1 = require("cloudinary");
const myHotelsRouters_1 = __importDefault(require("./routes/myHotelsRouters"));
const sendVerificationEmail_1 = require("./utils/sendVerificationEmail");
const hotelsRouter_1 = __importDefault(require("./routes/hotelsRouter"));
const chatbotRouter_1 = __importDefault(require("./routes/chatbotRouter"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)()); // * so that we can access the cookies in the request object (refer validateCookie.ts)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// server is going to accept request from client url -->
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
sendVerificationEmail_1.transporter.verify((err, success) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server is ready to take messages");
    }
});
app.use("/api/v1/hotels", hotelsRouter_1.default);
app.use("/api/v1/my-hotels", myHotelsRouters_1.default);
app.use("/api/v1/users", userRouters_1.default);
app.use("/api/v1/chat", chatbotRouter_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
