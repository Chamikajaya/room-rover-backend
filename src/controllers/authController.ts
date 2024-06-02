import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {loginValidationRules, registerValidationRules} from "../validations/authValidation";
import {handleValidationErrors} from "../middleware/validate";
import nodemailer from "nodemailer";
import {v4 as uuidv4} from 'uuid';
import {sendVerificationEmail} from "../utils/sendVerificationEmail";


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


// sends the user ID back to the frontend in the response.
export const sendUserIdUponTokenValidation = (req: Request, res: Response) => {
    return res.status(200).json({userId: req.userId});
};

export const register = [
    registerValidationRules,
    handleValidationErrors,
    async (req: Request, res: Response) => {


        try {

            const {email, password, firstName, lastName} = req.body;

            // check whether the user already exists
            const existingUser = await prisma.user.findFirst({
                where: {email}
            })

            if (existingUser) {
                return res.status(400).json({errorMessage: "Email already exists."});
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

            // check whether a token already exists
            const emailVerificationTokenExists = await prisma.userVerification.findFirst({
                where: {userId: user.id as string}
            });

            // if so remove it from db
            if (emailVerificationTokenExists) {
                await prisma.userVerification.delete({
                    where: {id: emailVerificationTokenExists.id}
                })
            }

            // generate email verification token
            const emailVerificationToken = uuidv4();
            const emailVerificationTokenExpiresAt = new Date(Date.now() + 60 * 15 * 1000);  // 15 minutes

            await prisma.userVerification.create({
                data: {
                    verificationToken: emailVerificationToken,
                    expiresAt: emailVerificationTokenExpiresAt,
                    userId: user.id
                }
            });

            await sendVerificationEmail(email, emailVerificationToken);

            // generate the token
            const token = generateToken(user.id);

            return res.status(201).json({successMessage: "Registered successfully. Please check your email to verify your account."});

            /*
           // after generating the JWT token, it is being set as a cookie in the response using the res.cookie method provided by Express.


           // setCookie(res, token);

           // return res.status(201).json({successMessage: "Registered successfully"});
           */


        } catch (e) {
            console.log("ERROR - REGISTER @POST --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    }
]


export const verifyEmail = async (req: Request, res: Response) => {

    const {token} = req.body;

    console.log(token)

    if (!token) {
        console.log("Token not found")
        return res.status(400).json({errorMessage: "Missing token"});
    }

    console.log("Token found: " + token);

    try {


        // If the token is provided, it tries to search a UserVerification instance in the database that has the same verificationToken as the provided token.

        const emailVerificationToken = await prisma.userVerification.findFirst({
            where: {verificationToken: token as string}
        });

        if (!emailVerificationToken || emailVerificationToken.expiresAt < new Date()) {
            return res.status(400).json({errorMessage: "Invalid or expired token"});
        }

        await prisma.userVerification.delete({  // because the token has been used and is no longer needed.
            where: {id: emailVerificationToken.id}
        });


        // setting the emailVerified field to true. This means that the user's email has been verified.
        const verifiedUser = await prisma.user.update({
            where: {id: emailVerificationToken.userId},
            data: {
                emailVerified: true
            }
        });

        // Generate a JWT token and set it as a cookie upon successful email verification.
        const jwtToken = generateToken(verifiedUser.id);
        setCookie(res, jwtToken);

        return res.status(200).json({successMessage: "Email verified successfully"});

    } catch (e) {
        console.log("ERROR - VERIFY EMAIL @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }


};


export const login = [
    loginValidationRules,
    handleValidationErrors,

    async (req: Request, res: Response) => {

        try {

            const {email, password} = req.body;

            const userExists = await prisma.user.findFirst({
                where: {email}
            });

            if (!userExists) {
                return res.status(400).json({errorMessage: "Invalid credentials"});
            }

            // check whether the password matches
            const passwordMatch = await bcrypt.compare(password, userExists.password);

            if (!passwordMatch) {
                return res.status(400).json({errorMessage: "Invalid credentials"});
            }

            // generate the token
            const token = generateToken(userExists.id);

            // set the token as a cookie
            setCookie(res, token);

            return res.status(200).json({userId: userExists.id});

        } catch (e) {
            console.log("ERROR - LOGIN @POST --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    }
]

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({successMessage: "Logged out successfully"});
    } catch (e) {
        console.log("ERROR - LOGOUT @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};