import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import {SearchResponse} from "../types/searchResponse";

const prisma = new PrismaClient();

export const searchHotels = async (req: Request, res: Response) => {

    console.log("Route hit --> GET /api/v1/hotels/search");

    try {

        // pagination
        const currPage = Number(req.query.page) || 1;
        const itemsPerPage = 5;
        const skip = (currPage - 1) * itemsPerPage;

        const totalHotels = await prisma.hotel.count();
        const totalPages = Math.ceil(totalHotels / itemsPerPage);

        const hotelsFound = await prisma.hotel.findMany({
            skip,
            take: itemsPerPage  // take is the number of items to be returned (limit)
        });

        const response: SearchResponse = {
            hotelsFound,
            paginationInfo: {
                totalHotels,
                totalPages,
                currPage

            }
        }

        res.status(200).json(response);


    } catch (e) {
        console.log("ERROR - SEARCH HOTEL @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }


}