import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();


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

        const user = await prisma.user.create({
            data: {
                email,
                password,
                firstName,
                lastName
            }
        });

        return res.json(user);

    } catch (e) {
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};