import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const prisma = new PrismaClient();

// generating the jwt token
const generateToken = (userId: string) => {
    return jwt.sign(
        {userId: userId},
        process.env.JWT_SECRET as string,
        {expiresIn: "1d"});
}

const setCookie = (res: Response, token: string) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // set to true in production
        maxAge: 1000 * 60 * 60 * 24,  // 1 day in ms -> After this time, the cookie will expire, and the user will need to authenticate again.
    });
};


export const register = async (req: Request, res: Response) => {
    try {

        const {email, password, firstName, lastName} = req.body;

        // check whether the user already exists
        const existingUser = await prisma.user.findFirst({
            where: {email}
        })

        if (existingUser) {
            return res.status(400).json({errorMessage: "Email already exists. Please sign-in instead"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            }
        });

        // generate the token
        const token = generateToken(user.id);

        // after generating the JWT token, it is being set as a cookie in the response using the res.cookie method provided by Express.
        setCookie(res, token);

        return res.status(201).json({successMessage: "User created successfully"});

    } catch (e) {
        console.log("ERROR - REGISTER @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};