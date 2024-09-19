import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouters";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import myHotelsRouter from "./routes/myHotelsRouters";
import {transporter} from "./utils/emailRelatedUtils/sendVerificationEmail";
import hotelsRouter from "./routes/hotelsRouter";
import bookingsRouter from "./routes/bookingsRouter";
import {generateEmbedding} from "./utils/vertex-ai";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

console.log("Client URL is set to : ", process.env.CLIENT_URL);
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// transporter.verify((err, success) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Server is ready to take messages");
//     }
// });

app.get("/health", async (req, res) => {
    res.send("Health is ok. Server is running");
});

app.use("/api/v1/hotels", hotelsRouter);
app.use("/api/v1/my-hotels", myHotelsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/my-bookings", bookingsRouter);

// Embedding endpoint using the new function
app.post("/api/v1/generate-embeddings", async (req, res) => {
    try {
        const {texts} = req.body;

        if (!texts || typeof texts !== "string") {
            return res.status(400).json({error: "Invalid input. 'texts' should be a string."});
        }

        const embeddings = await generateEmbedding(texts);
        res.json({embeddings});
    } catch (error) {
        console.error("Error generating embeddings:", error);
        res.status(500).json({error: "Failed to generate embeddings"});
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
