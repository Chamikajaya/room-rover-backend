import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import {PrismaClient} from "@prisma/client";
import userRouter from "./routes/userRouters";


const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.use('/api/v1/users', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

