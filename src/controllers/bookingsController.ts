import {PrismaClient} from '@prisma/client';
import {Request, Response} from 'express';

const prisma = new PrismaClient();


export const getMyBookings = async (req: Request, res: Response) => {
    console.log("Route hit --> GET /api/v1/my-bookings");

    try {

        const userId = req.userId as string;
        const bookings = await prisma.booking.findMany({
            where: {
                userId
            }
        });

        res.status(200).json(bookings);
    } catch (e) {
        console.log("ERROR - MY BOOKINGS @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});

    }
};